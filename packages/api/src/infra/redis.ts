import { injectable } from "inversify";
import { createClient, type createClientPool } from "redis";
import logger from "../logger";

/**
 * Redis database client.
 *
 * # Connection pooling
 *
 * This client uses a single persistent connection under the hood. According to the
 * {@link https://github.com/redis/node-redis/blob/master/docs/client-configuration.md#connection-pooling documentation},
 * connection pooling does not improve performance for Redis. While `node-redis` implements
 * a native {@link createClientPool connection pool}, it has limited API and does not provide any
 * benefits to our use-case.
 */
@injectable()
export abstract class Redis {
    public static async connect(url: string): Promise<Redis> {
        const client = createClient({ url });
        client.on("error", error => {
            throw error;
        });
        client.on("ready", () => {
            logger.trace("Redis is ready");
        });
        client.on("end", () => {
            logger.trace("Redis is disconnecting");
        });
        await client.connect();
        return client;
    }
}

// Some black magic fuckery with interface merging to get a desired API
export interface Redis extends ReturnType<typeof createClient> {}
