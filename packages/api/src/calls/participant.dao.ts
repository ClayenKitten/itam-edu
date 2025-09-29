import { injectable } from "inversify";
import { Postgres } from "../infra/postgres";

@injectable()
export class CallParticipantDao {
    public constructor(private postgres: Postgres) {}

    /** Returns the participation of a user, or null if not found. */
    public async get(
        callId: string,
        userId: string
    ): Promise<CallParticipantEntry | null> {
        const row = await this.postgres.kysely
            .selectFrom("callParticipants")
            .select([
                "callId",
                "userId",
                "firstJoinedAt",
                "lastLeftAt",
                "isMuted"
            ])
            .where("callId", "=", callId)
            .where("userId", "=", userId)
            .executeTakeFirst();
        return row ?? null;
    }

    /** Returns all participants for a call. */
    public async getAll(callId: string): Promise<CallParticipantEntry[]> {
        return await this.postgres.kysely
            .selectFrom("callParticipants")
            .select([
                "callId",
                "userId",
                "firstJoinedAt",
                "lastLeftAt",
                "isMuted"
            ])
            .where("callId", "=", callId)
            .orderBy("firstJoinedAt", "asc")
            .execute();
    }

    /** Returns true if user is currently in the call. */
    public async isPresent(callId: string, userId: string): Promise<boolean> {
        const row = await this.postgres.kysely
            .selectFrom("callParticipants")
            .select("userId")
            .where("callId", "=", callId)
            .where("userId", "=", userId)
            .where("lastLeftAt", "is", null)
            .executeTakeFirst();
        return row !== undefined;
    }

    /** Returns true if user has ever attended the call. */
    public async hasAttended(callId: string, userId: string): Promise<boolean> {
        const row = await this.postgres.kysely
            .selectFrom("callParticipants")
            .select("userId")
            .where("callId", "=", callId)
            .where("userId", "=", userId)
            .executeTakeFirst();
        return row !== undefined;
    }

    /** Records user joining the call. */
    public async joined(callId: string, userId: string): Promise<void> {
        await this.postgres.kysely
            .insertInto("callParticipants")
            .values({ callId, userId })
            .onConflict(oc =>
                oc
                    .columns(["callId", "userId"])
                    .doUpdateSet(() => ({ lastLeftAt: null }))
            )
            .execute();
    }

    /** Records user leaving the call. */
    public async left(callId: string, userId: string): Promise<void> {
        await this.postgres.kysely
            .updateTable("callParticipants")
            .set({ lastLeftAt: new Date() })
            .where("callId", "=", callId)
            .where("userId", "=", userId)
            .execute();
    }

    /**
     * Handles call ending.
     *
     * All remaining users are marked as left.
     * */
    public async callEnded(callId: string): Promise<void> {
        await this.postgres.kysely
            .updateTable("callParticipants")
            .set({ lastLeftAt: new Date() })
            .where("callId", "=", callId)
            .where("lastLeftAt", "is", null)
            .execute();
    }
}

export type CallParticipantEntry = {
    callId: string;
    userId: string;
    firstJoinedAt: Date;
    lastLeftAt: Date | null;
    isMuted: boolean;
};
