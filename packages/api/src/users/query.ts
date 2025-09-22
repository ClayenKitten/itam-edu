import { injectable } from "inversify";
import { User, type GlobalRole } from "itam-edu-common";
import { Postgres } from "../infra/postgres";
import { ForbiddenError, type HttpError } from "../api/errors";

@injectable()
export class UserQuery {
    public constructor(private postgres: Postgres) {}

    public async getAll(actor: User): Promise<UserDto[] | HttpError> {
        if (actor.permissions.users.view !== true) {
            return new ForbiddenError(
                "You are not allowed to view users list."
            );
        }
        return await this.postgres.kysely
            .selectFrom("users")
            .select([
                "id",
                "firstName",
                "lastName",
                "bio",
                "tgUsername",
                "avatar",
                "role"
            ])
            .orderBy("tgUsername asc")
            .execute();
    }
}

export type UserDto = {
    id: string;
    firstName: string;
    lastName: string | null;
    bio: string | null;
    tgUsername: string;
    avatar: string | null;
    role: GlobalRole;
};
