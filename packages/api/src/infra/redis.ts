import { inject, injectable } from "inversify";
import type { AppConfig } from "itam-edu-core/config";
import { createClientPool, type RedisClientPoolType } from "redis";
import ts from "@redis/time-series";

import logger from "../logger";

/** Redis database. */
@injectable()
export class Redis {
    public constructor(
        @inject("AppConfig")
        config: AppConfig
    ) {
        this.connectionString = config.redis.connectionString;

        this.pool = createClientPool({
            url: this.connectionString,
            modules: { ts }
        });

        this.pool.on("error", error => {
            logger.warning("Redis error", { error });
        });
        this.pool.on("ready", () => {
            logger.trace("Redis is ready");
        });
        this.pool.on("end", () => {
            logger.trace("Redis is disconnecting");
        });

        let _ = this.pool.connect();
    }

    protected connectionString: string;

    /** Redis connection pool. */
    public readonly pool: RedisClientPoolType<{ ts: typeof ts }>;
}
