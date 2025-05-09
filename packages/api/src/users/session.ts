import { randomBytes, randomUUID } from "crypto";
import type { User } from "itam-edu-common";
import { Repository } from "../db/repository";

export class Session {
    public constructor(
        public id: string,
        public userId: string,
        public token: string,
        public expires: Date
    ) {}

    /** Creates a new session. */
    public static create(user: User): Session {
        const id = randomUUID();
        const token = `itam-edu-${randomBytes(128).toString("base64url")}`;
        const expires = new Date(new Date().getTime() + this.TTL_MS);
        return new Session(id, user.id, token, expires);
    }

    /** Session time-to-live in milliseconds. */
    public static TTL_MS = 7 * 24 * 60 * 60 * 1000;
}

export class SessionRepository extends Repository {
    /**
     * Returns a user session by its token.
     *
     * Expired sessions are not returned.
     * */
    public async getByToken(token: string): Promise<Session | null> {
        const result = await this.db
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
        await this.db
            .insertInto("userSessions")
            .values({
                id,
                userId,
                token,
                expires
            })
            .execute();
    }
}
