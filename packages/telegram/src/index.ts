import { env } from "process";
import TelegramBot from "./bot";

const bot = new TelegramBot(env.ITAMEDU_TELEGRAM_TOKEN!);
bot.start();
