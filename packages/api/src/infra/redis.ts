import { injectable } from "inversify";
import { Redis as IORedis } from "ioredis";
import { Pool, createPool } from "generic-pool";
import { AppConfig } from "../config";
import logger from "../logger";

/** Redis database. */
@injectable()
export class Redis {
    public constructor(config: AppConfig) {
        this.connectionString = config.redis.connectionString;

        this.pool = createPool<IORedis>(
            {
                create: async () => {
                    logger.trace("Redis connection acquired", {
                        borrowed: this.pool.borrowed,
                        available: this.pool.available
                    });
                    return new IORedis(this.connectionString);
                },
                destroy: async ioredis => {
                    logger.trace("Redis connection released");
                    await ioredis.quit();
                }
            },
            {
                min: 2,
                max: 16
            }
        );
    }

    protected connectionString: string;
    protected pool: Pool<IORedis>;

    /**
     * Executes a callback with Redis connection provided.
     *
     * Note: connection is closed after the callback exits.
     * */
    public async exec<T>(cb: (redis: IORedis) => T | Promise<T>): Promise<T> {
        const redis = await this.pool.acquire();
        let result: T;
        try {
            result = await cb(redis);
        } catch (e) {
            await this.pool.release(redis);
            throw e;
        }
        await this.pool.release(redis);
        return result;
    }

    /**
     * Creates new Redis connection.
     *
     * Note: {@link exec} should be used unless you want to keep the connection for a while.
     * */
    public createConnection(): IORedis {
        return new IORedis(this.connectionString, {
            maxRetriesPerRequest: null
        });
    }
}
