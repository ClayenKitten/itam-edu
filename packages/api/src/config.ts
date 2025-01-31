/** Structured configuration parameters. */
export default interface AppConfig {
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
