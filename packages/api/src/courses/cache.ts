import { injectable } from "inversify";
import { Redis } from "../infra/redis";
import type { CourseDtoData } from "./query";
import logger from "../logger";

@injectable()
export class CourseCache {
    public constructor(protected redis: Redis) {}

    protected readonly EXPIRATION_SECONDS = 3600;
    protected getKey(id: string) {
        return `cache:course:${id}`;
    }

    /** Returns course from the cache. */
    public async get(id: string): Promise<CourseDtoData | null> {
        const key = this.getKey(id);
        const data = await this.redis.exec(r => r.get(key));
        if (data === null) {
            logger.trace("Cache miss", { cache: "course", course: id });
            return data;
        }
        logger.trace("Cache hit", { cache: "course", course: id });
        return JSON.parse(data);
    }

    /** Stores course in the cache. */
    public async set(course: CourseDtoData): Promise<void> {
        const key = this.getKey(course.id);
        const data = JSON.stringify(course);
        await this.redis.exec(r => r.setex(key, this.EXPIRATION_SECONDS, data));
    }

    /** Removes course from the cache. */
    public async delete(id: string): Promise<void> {
        const key = this.getKey(id);
        await this.redis.exec(async r => r.del(key));
    }
}
