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
            return await this.redis.exec(async r => {
                const result = (await r.call("TS.RANGE", key, "-", "+")) as [
                    number,
                    string
                ][];
                return result.map(([timestamp, value]) => ({
                    timestamp,
                    value: Number(value)
                }));
            });
        } catch (e) {
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
        const key = `courses:${courseId}:stats:${kind}`;
        await this.redis.exec(r => r.call("TS.ADD", key, "*", value));
    }
}

export type CourseStats = Record<CourseStatsKind, SeriesValue[]>;
export type SeriesValue = { timestamp: number; value: number };
export type CourseStatsKind = "students" | "staff";
