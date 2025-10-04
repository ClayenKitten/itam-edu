import { injectable } from "inversify";
import { Postgres } from "../../../infra/postgres";
import { Redis } from "../../../infra/redis";

@injectable()
export class StudentCounter {
    public constructor(
        private postgres: Postgres,
        private redis: Redis
    ) {}

    /** Returns historical data about student number. */
    public async get(courseId: string): Promise<SeriesValue[]> {
        const key = `courses:${courseId}:statistics:students`;
        if ((await this.redis.exists(key)) === 0) {
            return [];
        }
        return await this.redis.ts.range(key, "-", "+");
    }

    /** Records new data entry. */
    public async record(courseId: string): Promise<void> {
        const key = `courses:${courseId}:statistics:students`;
        const { count } = await this.postgres.kysely
            .selectFrom("userCourses")
            .select(cb => cb.fn.countAll<number>().as("count"))
            .where("role", "=", "student")
            .executeTakeFirstOrThrow();
        await this.redis.ts.add(key, "*", count);
    }
}

export type SeriesValue = { timestamp: number; value: number };
