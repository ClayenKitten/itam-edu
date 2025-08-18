import { injectable } from "inversify";
import { Redis } from "../infra/redis";
import logger from "../logger";

@injectable()
export class CourseStatsRepository {
    public constructor(protected redis: Redis) {}

    public async get(
        kind: CourseStatsKind,
        courseId: string
    ): Promise<SeriesValue[]> {
        const key = `courses:${courseId}:stats:${kind}`;
        try {
            if ((await this.redis.pool.exists(key)) === 0) {
                return [];
            }
            return await this.redis.pool.ts.range(key, "-", "+");
        } catch (error) {
            logger.warning("failed to fetch statistics", {
                error: error?.toString()
            });
            return [];
        }
    }

    public async getAll(courseId: string): Promise<CourseStats> {
        const [students, staff] = await Promise.all([
            this.get("students", courseId),
            this.get("staff", courseId)
        ]);
        return { staff, students };
    }

    public async add(
        kind: CourseStatsKind,
        courseId: string,
        value: number
    ): Promise<void> {
        try {
            const key = `courses:${courseId}:stats:${kind}`;
            await this.redis.pool.ts.add(key, "*", value);
        } catch (e) {
            logger.error("Failed to add course statistics entry", {
                kind,
                courseId,
                error: e
            });
        }
    }
}

export type CourseStats = Record<CourseStatsKind, SeriesValue[]>;
export type SeriesValue = { timestamp: number; value: number };
export type CourseStatsKind = "students" | "staff";
