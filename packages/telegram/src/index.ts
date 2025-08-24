import { env } from "process";
import TelegramBot from "./bot";
import { Logger } from "itam-edu-core/logger";

const logger = new Logger();
const bot = new TelegramBot(env.ITAMEDU_TELEGRAM_TOKEN!, logger);
bot.start();
