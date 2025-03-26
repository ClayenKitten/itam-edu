import { Telegraf } from "telegraf";
import { env } from "process";

import { extendContext, type BotContext } from "./ctx.js";
import logger from "../logger.js";
import setupHandlers from "./handlers/index.js";
import type { ParseMode } from "telegraf/types";
import type { AppContext } from "../ctx.js";

export default class TelegramBot {
    /** Internal Telegraf instance. */
    private telegraf: Telegraf<BotContext>;

    public constructor(public ctx: AppContext) {
        this.telegraf = new Telegraf<BotContext>(ctx.config.tg.token).use(
            async (ctx, next) => {
                await extendContext(ctx, this.ctx);
                await next();
            }
        );

        if (env.NODE_ENV === "production") {
            process.once("SIGINT", () => this.telegraf.stop("SIGINT"));
            process.once("SIGTERM", () => this.telegraf.stop("SIGTERM"));
        }
        setupHandlers(this.telegraf);
    }

    /** Starts bot in polling mode. */
    public async start(): Promise<void> {
        return new Promise(resolve => {
            this.telegraf
                .launch(() => {
                    logger.info("Started Telegram bot", {
                        mode: "polling",
                        username: this.telegraf.botInfo?.username
                    });
                    resolve();
                })
                .finally(() => {
                    logger.info("Stopped Telegram bot");
                });
        });
    }

    /** Stops bot. */
    public async stop(): Promise<void> {
        this.telegraf.stop();
    }

    /** Sends Telegram message. */
    public async sendMessage(
        chatId: string,
        text: string,
        extra?: { parse_mode?: ParseMode }
    ) {
        return await this.telegraf.telegram.sendMessage(chatId, text, extra);
    }
}
