import { env } from "process";

/** Structured configuration parameters. */
export interface AppConfig {
    api: {
        /**
         * API server host
         *
         * @default 0.0.0.0
         */
        host: string;
        /**
         * API server port
         *
         * @default 3000
         */
        port: string;
    };
    tg: {
        /** Telegram API token. */
        token: string;
        /** Support account username without a leading `@`, e.g. `durov`. */
        supportUsername: string;
    };
    /** Base path for website (frontend). */
    webUrl: string;
    /** Postgres connection configuration. */
    postgres: {
        /**
         * Connection string for Postgres database.
         *
         *  ### Example
         *
         * `postgres://username:password@hostname:port/databaseName`
         */
        connectionString: string;
    };
    /** Redis connection configuration. */
    redis: {
        /** Connection string for Redis database.
         *
         *  ### Example
         *
         * `redis://username:password@hostname:port`
         */
        connectionString: string;
    };
    /** S3 connection configuration. */
    s3: {
        endpoint: string;
        port?: string;
        useSSL: boolean;
        accessKey: string;
        secretKey: string;
        bucket: string;
    };
}

/** Creates application config from environment variables. */
export function createConfigFromEnv(): AppConfig {
    return {
        api: {
            host: env.ITAM_EDU_API_HOST ?? "0.0.0.0",
            port: env.ITAM_EDU_API_PORT ?? "3000"
        },
        tg: {
            token: env.ITAM_EDU_API_TG_TOKEN!,
            supportUsername: env.ITAM_EDU_API_TG_SUPPORT_USERNAME!
        },
        webUrl: env.ITAM_EDU_FRONTEND_URL!,
        postgres: {
            connectionString: env.ITAM_EDU_API_POSTGRES_CONNECTION_STRING!
        },
        redis: {
            connectionString: env.ITAM_EDU_API_REDIS_CONNECTION_STRING!
        },
        s3: {
            endpoint: env.ITAM_EDU_S3_PROXY_ENDPOINT!,
            port: env.ITAM_EDU_S3_PROXY_PORT,
            useSSL: !(env.ITAM_EDU_S3_PROXY_SSL! === "false"),
            accessKey: env.ITAM_EDU_S3_PROXY_ACCESS_KEY!,
            secretKey: env.ITAM_EDU_S3_PROXY_SECRET_KEY!,
            bucket: env.ITAM_EDU_S3_PROXY_BUCKET!
        }
    };
}
