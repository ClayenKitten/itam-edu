import { env } from "process";
import TelegramBot from "./bot";

const bot = new TelegramBot(env.ITAM_EDU_API_TG_TOKEN!);
bot.start();
