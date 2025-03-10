namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: "production" | "development";
        ITAM_EDU_API_HOST: string;
        ITAM_EDU_API_PORT: string;
        ITAM_EDU_API_DB_CONNECTION_STRING: string;
        ITAM_EDU_API_REDIS_CONNECTION_STRING: string;
        ITAM_EDU_API_WEB_HOST: string;
        ITAM_EDU_API_TG_TOKEN: string;
        ITAM_EDU_API_TG_SUPPORT_USERNAME: string;
    }
}
