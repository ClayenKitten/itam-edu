import ApiServer from "./api";
import TelegramBot from "./telegram";
import NotificationWorker from "./notifications/worker";
import { createAppContext } from "./ctx";
import { createConfigFromEnv } from "./config";

const config = createConfigFromEnv();
const ctx = createAppContext(config);

const api = new ApiServer(ctx);
const telegram = new TelegramBot(ctx);
const notifications = new NotificationWorker(ctx, telegram);
await Promise.all([api.start(), telegram.start(), notifications.start()]);
