import * as schema from "./schema";
import { Repository } from "../db/repository";
import { schemaFields } from "../util";
import { User, Permissions } from "./entity";
import logger from "../logger";

export default class UserRepository extends Repository {
    public async getByToken(token: string): Promise<User | null> {
        const user = await this.db
            .selectFrom("users")
            .selectAll("users")
            .leftJoin("userSessions", "userSessions.userId", "users.id")
            .where("userSessions.token", "=", token)
            .executeTakeFirst();
        if (!user) return null;

        const enrollments = await this.db
            .selectFrom("courseStudents")
            .select("courseId")
            .where("userId", "=", user.id)
            .execute();

        const coursePermissions = await this.db
            .selectFrom("courseStaff")
            .select(["courseId", ...schemaFields(schema.coursePermissions)])
            .where("userId", "=", user.id)
            .execute();

        return new User(
            user,
            enrollments,
            new Permissions(
                {
                    isSupervisor: user.isSupervisor,
                    canCreateCourses: user.canCreateCourses,
                    canPublishCourses: user.canPublishCourses
                },
                coursePermissions.map(({ courseId, ...permissions }) => ({
                    courseId,
                    permissions
                }))
            )
        );
    }

    public async getById(id: string): Promise<User | null> {
        const user = await this.db
            .selectFrom("users")
            .selectAll("users")
            .where("id", "=", id)
            .executeTakeFirst();
        if (!user) return null;

        const enrollments = await this.db
            .selectFrom("courseStudents")
            .select("courseId")
            .where("userId", "=", user.id)
            .execute();

        const coursePermissions = await this.db
            .selectFrom("courseStaff")
            .select(["courseId", ...schemaFields(schema.coursePermissions)])
            .where("userId", "=", user.id)
            .execute();

        return new User(
            user,
            enrollments,
            new Permissions(
                {
                    isSupervisor: user.isSupervisor,
                    canCreateCourses: user.canCreateCourses,
                    canPublishCourses: user.canPublishCourses
                },
                coursePermissions.map(({ courseId, ...permissions }) => ({
                    courseId,
                    permissions
                }))
            )
        );
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
            logger.error("Error during db transaction", { error: e });
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
}
