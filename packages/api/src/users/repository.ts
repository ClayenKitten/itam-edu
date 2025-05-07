import { Repository } from "../db/repository";
import { User, type CoursePermissions } from "itam-edu-common";
import logger from "../logger";
import type { Selectable } from "kysely";
import type { DB } from "itam-edu-db";

export default class UserRepository extends Repository {
    public async getByToken(token: string): Promise<User | null> {
        const user = await this.db
            .selectFrom("users")
            .selectAll("users")
            .leftJoin("userSessions", "userSessions.userId", "users.id")
            .where("userSessions.token", "=", token)
            .executeTakeFirst();
        if (!user) return null;

        const userCourses = await this.db
            .selectFrom("userCourses")
            .selectAll()
            .where("userId", "=", user.id)
            .execute();
        const enrollments = userCourses
            .filter(u => u.isStaff === false)
            .map(u => ({ courseId: u.courseId }));
        const coursePermissions = userCourses.filter(u => u.isStaff === true);

        return this.toEntity(user, enrollments, coursePermissions);
    }

    public async getById(id: string): Promise<User | null> {
        const user = await this.db
            .selectFrom("users")
            .selectAll("users")
            .where("id", "=", id)
            .executeTakeFirst();
        if (!user) return null;

        const userCourses = await this.db
            .selectFrom("userCourses")
            .selectAll()
            .where("userId", "=", user.id)
            .execute();
        const enrollments = userCourses
            .filter(u => u.isStaff === false)
            .map(u => ({ courseId: u.courseId }));
        const coursePermissions = userCourses.filter(u => u.isStaff === true);

        return this.toEntity(user, enrollments, coursePermissions);
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

    private toEntity(
        user: Selectable<DB["users"]>,
        enrollments: { courseId: string }[],
        coursePermissions: Selectable<DB["userCourses"]>[]
    ) {
        return new User(
            user.id,
            {
                firstName: user.firstName,
                lastName: user.lastName,
                patronim: user.patronim,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio
            },
            { id: user.tgUserId, username: user.tgUsername },
            enrollments.map(({ courseId }) => ({ courseId })),
            {
                global: {
                    isSupervisor: user.isSupervisor,
                    canCreateCourses: user.canCreateCourses,
                    canPublishCourses: user.canPublishCourses
                },
                course: coursePermissions.reduce(
                    (accumulator, { courseId, ...perms }) => {
                        accumulator[courseId] = {
                            isOwner: perms.isOwner,
                            canEditContent: perms.canEditContent,
                            canEditInfo: perms.canEditInfo,
                            canManageSubmissions: perms.canManageSubmissions
                        };
                        return accumulator;
                    },
                    {} as Record<string, CoursePermissions>
                )
            }
        );
    }
}
