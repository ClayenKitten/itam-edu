import { injectable } from "inversify";
import { sql } from "kysely";
import { Postgres } from "../infra/postgres";

@injectable()
export class CallDao {
    public constructor(private postgres: Postgres) {}

    /** Returns a call by its id, or null if not found. */
    public async get(id: string): Promise<CallDto | null> {
        const row = await this.postgres.kysely
            .selectFrom("calls")
            .select([
                "id",
                "courseId",
                "title",
                "cover",
                "startedAt",
                "startedBy",
                "endedAt",
                "endedBy"
            ])
            .where("id", "=", id)
            .executeTakeFirst();
        return row ?? null;
    }

    /** Returns all calls. */
    public async getAll(courseId?: string | null): Promise<CallDto[]> {
        let query = this.postgres.kysely
            .selectFrom("calls")
            .select([
                "id",
                "courseId",
                "title",
                "cover",
                "startedAt",
                "startedBy",
                "endedAt",
                "endedBy"
            ])
            .orderBy("startedAt", "desc");
        if (courseId !== undefined) {
            query = query.where("courseId", "is not distinct from", courseId);
        }
        return await query.execute();
    }

    /** Creates a new call. */
    public async create(
        // TODO: we currently pass id because call is attached to lesson when they have equal ids.
        // We need to either replace this logic with better solution or create separate creation
        // workflow for lesson calls.
        id: string,
        title: string,
        courseId: string | null,
        startedBy: string,
        cover: string | null
    ): Promise<CallDto> {
        const row = await this.postgres.kysely
            .insertInto("calls")
            .values({
                id,
                title,
                courseId,
                startedBy,
                cover
            })
            .returning([
                "id",
                "title",
                "courseId",
                "startedAt",
                "startedBy",
                "cover",
                "endedAt",
                "endedBy"
            ])
            .executeTakeFirstOrThrow();
        return row;
    }

    /** Marks the call as ended. */
    public async end(id: string, endedBy: string): Promise<void> {
        await this.postgres.kysely
            .updateTable("calls")
            .set({
                endedAt: sql`now()`,
                endedBy
            })
            .where("id", "=", id)
            .where("endedAt", "is", null)
            .execute();
    }
}

export type CallDto = {
    id: string;
    courseId: string | null;
    title: string;
    cover: string | null;
    startedAt: Date;
    startedBy: string;
    endedAt: Date | null;
    endedBy: string | null;
};
