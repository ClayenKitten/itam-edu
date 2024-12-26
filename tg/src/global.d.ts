namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: "production" | "development";
        ITAM_EDU_TG_BOT_TOKEN: string;
        ITAM_EDU_TG_WEBHOOK_ENABLED: "true" | "false";
        ITAM_EDU_TG_WEBHOOK_DOMAIN: string;
        ITAM_EDU_TG_WEBHOOK_PORT: string;
        ITAM_EDU_TG_API_PORT: string;
    }
}
