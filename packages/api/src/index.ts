import { env } from "process";
import type AppConfig from "./config";

import ApiServer from "./api";
import TelegramBot from "./telegram";
import NotificationWorker from "./notifications/worker";

const config: AppConfig = {
    db: {
        connectionString: env.ITAM_EDU_API_DB_CONNECTION_STRING
    },
    api: {
        host: env.ITAM_EDU_API_HOST ?? "0.0.0.0",
        port: env.ITAM_EDU_API_PORT ?? "3000"
    },
    tg: {
        token: env.ITAM_EDU_API_TG_TOKEN,
        supportUsername: env.ITAM_EDU_API_TG_SUPPORT_USERNAME
    },
    webUrl: env.ITAM_EDU_API_WEB_HOST
};

const api = new ApiServer(config);
const telegram = new TelegramBot(config);
const notifications = new NotificationWorker(config, telegram);

await Promise.all([api.start(), telegram.start(), notifications.start()]);
