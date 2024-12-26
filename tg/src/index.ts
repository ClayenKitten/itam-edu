import { env } from "process";
import Bot from "./bot.js";
import startApi from "./api.js";
import type { Telegraf } from "telegraf";

const bot = new Bot(env.ITAM_EDU_TG_BOT_TOKEN);
const webhook: Telegraf.LaunchOptions["webhook"] =
    env.ITAM_EDU_TG_WEBHOOK_ENABLED === "true"
        ? {
              domain: env.ITAM_EDU_TG_WEBHOOK_DOMAIN,
              port: Number(env.ITAM_EDU_TG_WEBHOOK_PORT)
          }
        : undefined;
await bot.launch({ webhook });

startApi(bot, { port: Number(env.ITAM_EDU_TG_API_PORT) });
