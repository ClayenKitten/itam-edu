import * as schema from "./schema";
import { PermissionKinds } from "./permissions";
import { Repository } from "../../plugins/db/repository";
import { schemaFields } from "../../util";

export default class UserRepository extends Repository {
    public async getByToken(
        token: string
    ): Promise<typeof schema.user.static | null> {
        const user = await this.db
            .selectFrom("users")
            .select([
                "users.id",
                ...schemaFields(schema.user).filter(x => x !== "id")
            ])
            .leftJoin("userSessions", "userSessions.userId", "users.id")
            .where("userSessions.token", "=", token)
            .executeTakeFirst();
        if (user === undefined) return null;
        return user;
    }

    public async createLoginAttempt({
        tgUserId,
        tgChatId,
        tgUsername,
        code,
        expires
    }: {
        tgUserId: string;
        tgChatId: string;
        tgUsername: string;
        code: string;
        expires: Date;
    }): Promise<boolean> {
        try {
            return await this.db.transaction().execute(async trx => {
                const { id: userId } = await trx
                    .insertInto("users")
                    .values({ tgChatId, tgUserId, tgUsername })
                    .onConflict(oc =>
                        oc
                            .column("tgUserId")
                            .doUpdateSet({ tgChatId, tgUsername })
                    )
                    .returning("id")
                    .executeTakeFirstOrThrow();

                await trx
                    .deleteFrom("userLoginAttempts")
                    .where(({ eb, or }) =>
                        or([eb("userId", "=", userId), eb("code", "=", code)])
                    )
                    .execute();

                const result = await trx
                    .insertInto("userLoginAttempts")
                    .values({ userId, code, expires })
                    .executeTakeFirstOrThrow();

                return result.numInsertedOrUpdatedRows === 1n;
            });
        } catch (e) {
            this.logger.error("Error during db transaction", { error: e });
            return false;
        }
    }

    public async completeLoginAttempt({
        code,
        expires,
        token
    }: {
        code: string;
        token: string;
        expires: Date;
    }): Promise<boolean> {
        return await this.db.transaction().execute(async trx => {
            const result = await trx
                .deleteFrom("userLoginAttempts")
                .where("code", "=", code)
                .where("expires", ">", new Date())
                .returning(["userId"])
                .executeTakeFirst();
            if (result === undefined) return false;
            const { userId } = result;

            await trx
                .insertInto("userSessions")
                .values({ userId, token, expires })
                .executeTakeFirst();

            return true;
        });
    }

    public async getPermissions(userId: string) {
        const user = await this.db
            .selectFrom("users")
            .select(PermissionKinds["user"])
            .where("id", "=", userId)
            .executeTakeFirst();
        if (user === undefined) return null;

        const course = user.isStaff
            ? await this.db
                  .selectFrom("courseStaff")
                  .select(["courseId", ...PermissionKinds["course"]])
                  .where("userId", "=", userId)
                  .execute()
            : [];
        type CoursePermission = Omit<(typeof course)[number], "courseId">;

        return {
            user,
            course: course.reduce(
                (obj, val) => {
                    const { courseId, ...permissions } = val;
                    obj[courseId] = permissions;
                    return obj;
                },
                {} as Record<string, CoursePermission>
            )
        };
    }
}
