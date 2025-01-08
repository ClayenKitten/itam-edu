namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: "production" | "development";
        ITAM_EDU_API_HOST: string;
        ITAM_EDU_API_PORT: string;
        ITAM_EDU_API_DB_CONNECTION_STRING: string;
    }
}
