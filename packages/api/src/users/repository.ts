import { User } from "itam-edu-common";
import type { Selectable } from "kysely";
import { Postgres, type DB } from "itam-edu-core/infra/postgres";
import { injectable } from "inversify";
import type { UpdateUserDto } from "./schema";

@injectable()
export class UserRepository {
    public constructor(protected postgres: Postgres) {}

    /** Returns a user by its id. */
    public async getById(id: string): Promise<User | null> {
        const [user, userCourses] = await Promise.all([
            this.postgres.kysely
                .selectFrom("users")
                .selectAll("users")
                .where("id", "=", id)
                .executeTakeFirst(),
            this.postgres.kysely
                .selectFrom("userCourses")
                .selectAll()
                .where("userId", "=", id)
                .execute()
        ]);
        if (!user) return null;
        return this.toEntity(user, userCourses);
    }

    /** Updates user information. */
    public async update(user: User, dto: UpdateUserDto): Promise<void> {
        await this.postgres.kysely
            .updateTable("users")
            .set(dto)
            .where("users.id", "=", user.id)
            .execute();
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
        return this.toEntity(user, userCourses);
    }

    private toEntity(
        user: Selectable<DB["users"]>,
        userCourses: Selectable<DB["userCourses"]>[]
    ) {
        return new User(
            user.id,
            {
                firstName: user.firstName,
                lastName: user.lastName,
                patronim: user.patronim,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                role: user.role
            },
            { id: user.tgUserId, username: user.tgUsername },
            userCourses.map(uc => ({ id: uc.courseId, role: uc.role }))
        );
    }
}
