import { env } from "process";
import { Type as t } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

/** Application configuration. */
export type AppConfig = typeof appConfigSchema.static;

export const appConfigSchema = t.Object({
    /** Web server configuration. */
    server: t.Object({
        /** Public hostname to which the system is deployed. */
        hostname: t.String({ format: "hostname" }),
        /**
         * TCP ports to use.
         *
         * Default values are recommended for containerized deployment.
         * */
        ports: t.Object({
            frontend: t.Integer({ default: 3000, minimum: 1 }),
            backend: t.Integer({ default: 3000, minimum: 1 })
        })
    }),
    /** Telegram bot configuration. */
    telegram: t.Object({
        /** Telegram API token. */
        token: t.String(),
        /** Support account username without a leading `@`, e.g. `durov`. */
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
         *  ### Example
         *
         * `postgres://username:password@hostname:port/databaseName`
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

/**
 * Creates configuration object from environment variables.
 *
 * @throws {ConfigError} Invalid configuration: required value is missing or invalid.
 * */
export function createConfigFromEnv(): AppConfig {
    const gatheredConfig = {
        server: {
            hostname: env.ITAMEDU_HOSTNAME!,
            ports: {
                frontend: Number.parseInt(env.ITAMEDU_FRONTEND_PORT ?? "3000"),
                backend: Number.parseInt(env.ITAMEDU_BACKEND_PORT ?? "3000")
            }
        },
        telegram: {
            token: env.ITAMEDU_TELEGRAM_TOKEN!,
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
        const config = Value.Decode(appConfigSchema, gatheredConfig);
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

export class ConfigError extends Error {
    constructor(public fields: { message: string; path: string }[]) {
        super("invalid configuration provided");
        this.name = this.constructor.name;
    }
}
