import ApiServer from "./api";
import TelegramBot from "./telegram";
import NotificationWorker from "./notifications/worker";
import { getAppContext } from "./ctx";

const ctx = getAppContext();
const api = new ApiServer(ctx);
const telegram = new TelegramBot(ctx);
const notifications = new NotificationWorker(ctx, telegram);

await Promise.all([api.start(), telegram.start(), notifications.start()]);
