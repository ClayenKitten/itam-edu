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
    db: {
        /** Postgres connection string. */
        connectionString: string;
    };
    tg: {
        /** Telegram API token. */
        token: string;
        /** Support account username without a leading `@`, e.g. `durov`. */
        supportUsername: string;
    };
    /** Base path for website (frontend). */
    webUrl: string;
}

/** Creates application config from environment variables. */
export function createConfigFromEnv(): AppConfig {
    return {
        db: {
            connectionString: env.ITAM_EDU_API_DB_CONNECTION_STRING!
        },
        api: {
            host: env.ITAM_EDU_API_HOST ?? "0.0.0.0",
            port: env.ITAM_EDU_API_PORT ?? "3000"
        },
        tg: {
            token: env.ITAM_EDU_API_TG_TOKEN!,
            supportUsername: env.ITAM_EDU_API_TG_SUPPORT_USERNAME!
        },
        webUrl: env.ITAM_EDU_FRONTEND_URL!
    };
}
