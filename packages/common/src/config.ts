import { env } from "process";
import { FormatRegistry, Type as t } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

/** Application configuration. */
export type AppConfig = typeof appConfigSchema.static;

export const appConfigSchema = t.Object({
    /**
     * Public origin to which the system is deployed.
     *
     * Domain name and protocol are required. Port and path may be provided if needed.
     *
     * ### Examples
     *
     * - http://www.localhost
     * - https://example.com:3000/itamedu
     * */
    origin: t.String({ format: "uri" }),
    /** JsonWebToken configuration. */
    jwt: t.Object({
        secret: t.String({ minLength: 32 })
    }),
    /** Web servers configuration. */
    servers: t.Object({
        frontend: t.Object({
            /** Internal server to which  */
            host: t.String({ default: "frontend" }),
            port: t.Integer({ default: 3000, minimum: 1 })
        }),
        backend: t.Object({
            host: t.String({ default: "backend" }),
            port: t.Integer({ default: 3000, minimum: 1 })
        }),
        files: t.Object({
            host: t.String({ default: "files" }),
            port: t.Integer({ default: 3000, minimum: 1 })
        })
    }),
    /** Telegram bot configuration. */
    telegram: t.Object({
        /** Telegram API token. */
        token: t.String(),
        /**
         * Telegram bot username.
         *
         * @example ```itatmisis_bot```
         * */
        username: t.String(),
        /**
         * Support account username.
         *
         * @example ```durov```
         */
        supportUsername: t.String()
    }),
    /** LiveKit connection configuration. */
    livekit: t.Object({
        url: t.String(),
        apiKey: t.String(),
        secretKey: t.String()
    }),
    /** Postgres connection configuration. */
    postgres: t.Object({
        /**
         * Connection string for Postgres database.
         *
         * @example
         *
         * ```postgres://username:password@hostname:port/databaseName```
         */
        connectionString: t.String({ format: "uri" })
    }),
    /** Redis connection configuration. */
    redis: t.Object({
        /** Connection string for Redis database.
         *
         *  ### Example
         *
         * `redis://username:password@hostname:port`
         */
        connectionString: t.String({ format: "uri" })
    }),
    /** S3 connection configuration. */
    s3: t.Object({
        endpoint: t.String({ format: "uri" }),
        accessKey: t.String(),
        secretKey: t.String(),
        bucket: t.String()
    })
});
FormatRegistry.Set("uri", val => {
    try {
        let _url = new URL(val);
        return true;
    } catch (_) {
        return false;
    }
});

/**
 * Creates configuration object from environment variables.
 *
 * @throws {ConfigError} Invalid configuration: required value is missing or invalid.
 * */
export function createConfigFromEnv(): AppConfig {
    const gatheredConfig = {
        origin: env.ITAMEDU_ORIGIN?.replace(/\/+$/, "")!,
        jwt: {
            secret: env.ITAMEDU_JWT_SECRET!
        },
        servers: {
            frontend: {
                host: env.ITAMEDU_FRONTEND_HOST!,
                port: toNumberOrUndef(env.ITAMEDU_FRONTEND_PORT)!
            },
            backend: {
                host: env.ITAMEDU_BACKEND_HOST!,
                port: toNumberOrUndef(env.ITAMEDU_BACKEND_PORT)!
            },
            files: {
                host: env.ITAMEDU_FILES_HOST!,
                port: toNumberOrUndef(env.ITAMEDU_FILES_PORT)!
            }
        },
        telegram: {
            token: env.ITAMEDU_TELEGRAM_TOKEN!,
            username: env.ITAMEDU_TELEGRAM_USERNAME!,
            supportUsername: env.ITAMEDU_TELEGRAM_SUPPORT_USERNAME!
        },
        postgres: {
            connectionString: env.ITAMEDU_POSTGRES_CONNECTION_STRING!
        },
        redis: {
            connectionString: env.ITAMEDU_REDIS_CONNECTION_STRING!
        },
        s3: {
            endpoint: env.ITAMEDU_S3_ENDPOINT!,
            accessKey: env.ITAMEDU_S3_ACCESS_KEY!,
            secretKey: env.ITAMEDU_S3_SECRET_KEY!,
            bucket: env.ITAMEDU_S3_BUCKET!
        },
        livekit: {
            url: env.ITAMEDU_LIVEKIT_URL!,
            apiKey: env.ITAMEDU_LIVEKIT_APIKEY!,
            secretKey: env.ITAMEDU_LIVEKIT_SECRET!
        }
    } satisfies AppConfig;

    try {
        const config = Value.Parse(appConfigSchema, gatheredConfig);
        return config;
    } catch (e) {
        const errors = Array.from(
            Value.Errors(appConfigSchema, gatheredConfig)
        );
        throw new ConfigError(
            errors.map(err => ({ message: err.message, path: err.path }))
        );
    }
}
const toNumberOrUndef = (val: string | undefined): number | undefined => {
    return val !== undefined ? Number(val) : undefined;
};

export class ConfigError extends Error {
    constructor(public fields: { message: string; path: string }[]) {
        super("invalid configuration provided");
        this.name = this.constructor.name;
    }
}
