import { User, type CoursePermissions } from "itam-edu-common";
import type { Selectable } from "kysely";
import type { DB } from "itam-edu-db";
import { injectable } from "inversify";
import { Postgres } from "../infra/postgres";

@injectable()
export class UserRepository {
    public constructor(protected postgres: Postgres) {}

    /** Returns a user by its id. */
    public async getById(id: string): Promise<User | null> {
        const user = await this.postgres.kysely
            .selectFrom("users")
            .selectAll("users")
            .where("id", "=", id)
            .executeTakeFirst();
        if (!user) return null;

        const userCourses = await this.postgres.kysely
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

    /** Returns a user by its access token. */
    public async getByToken(token: string): Promise<User | null> {
        const user = await this.postgres.kysely
            .selectFrom("users")
            .selectAll("users")
            .leftJoin("userSessions", "userSessions.userId", "users.id")
            .where("userSessions.token", "=", token)
            .executeTakeFirst();
        if (!user) return null;

        const userCourses = await this.postgres.kysely
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

    /**
     * Creates a user if it does not exist.
     *
     * If the user already exists, updates Telegram username. Other fields are unchanged.
     * */
    public async create(createUser: {
        firstName: string;
        lastName: string | null;
        tgUserId: string;
        tgUsername: string;
    }): Promise<User> {
        const user = await this.postgres.kysely
            .insertInto("users")
            .values({
                firstName: createUser.firstName,
                lastName: createUser.lastName,
                tgChatId: createUser.tgUserId,
                tgUserId: createUser.tgUserId,
                tgUsername: createUser.tgUsername
            })
            .onConflict(oc =>
                oc
                    .column("tgUserId")
                    .doUpdateSet({ tgUsername: createUser.tgUsername })
            )
            .returningAll()
            .executeTakeFirstOrThrow();

        const userCourses = await this.postgres.kysely
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
