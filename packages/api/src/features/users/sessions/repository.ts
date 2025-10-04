import { injectable } from "inversify";
import { Postgres } from "../../../infra/postgres";
import { Session } from "./entity";

@injectable()
export class SessionRepository {
    public constructor(protected postgres: Postgres) {}

    /**
     * Returns a user session by its token.
     *
     * Expired sessions are not returned.
     * */
    public async getByToken(token: string): Promise<Session | null> {
        const result = await this.postgres.kysely
            .selectFrom("userSessions")
            .selectAll()
            .where("token", "=", token)
            .where("expires", ">", new Date())
            .executeTakeFirst();
        if (!result) return null;
        const { id, userId, expires } = result;
        return new Session(id, userId, token, expires);
    }

    /** Persists a new session. */
    public async add(session: Session): Promise<void> {
        const { id, userId, token, expires } = session;
        await this.postgres.kysely
            .insertInto("userSessions")
            .values({
                id,
                userId,
                token,
                expires
            })
            .execute();
    }

    /** Removes active session. */
    public async remove(sessionId: string): Promise<void> {
        await this.postgres.kysely
            .deleteFrom("userSessions")
            .where("id", "=", sessionId)
            .execute();
    }
}
