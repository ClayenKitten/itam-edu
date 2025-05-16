import { injectable } from "inversify";
import { env } from "process";

/** Application configuration. */
@injectable()
export class AppConfig {
    private constructor(protected schema: AppConfigSchema) {}

    public get api() {
        return this.schema.api;
    }
    public get tg() {
        return this.schema.tg;
    }
    public get postgres() {
        return this.schema.postgres;
    }
    public get redis() {
        return this.schema.redis;
    }
    public get s3() {
        return this.schema.s3;
    }
    public get livekit() {
        return this.schema.livekit;
    }
    public get webUrl() {
        return this.schema.webUrl;
    }

    public static createFromEnv(): AppConfig {
        return new AppConfig({
            api: {
                host: env.ITAM_EDU_API_HOST ?? "0.0.0.0",
                port: env.ITAM_EDU_API_PORT ?? "3000"
            },
            tg: {
                token: env.ITAM_EDU_API_TG_TOKEN!,
                supportUsername: env.ITAM_EDU_API_TG_SUPPORT_USERNAME!
            },
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
            },
            livekit: {
                url: env.ITAM_EDU_API_LIVEKIT_URL!,
                apiKey: env.ITAM_EDU_API_LIVEKIT_APIKEY!,
                secretKey: env.ITAM_EDU_API_LIVEKIT_SECRET!
            },
            webUrl: env.ITAM_EDU_FRONTEND_URL!
        });
    }
}

/** Structured configuration parameters. */
export interface AppConfigSchema {
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
    livekit: {
        url: string;
        apiKey: string;
        secretKey: string;
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
