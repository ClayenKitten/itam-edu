import { Telegraf } from "telegraf";
import { env } from "process";

import { extendContext, type BotContext } from "./ctx.js";
import type AppConfig from "../config.js";
import Logger from "../logger.js";
import setupHandlers from "./handlers/index.js";

export default class TelegramBot {
    private telegraf: Telegraf<BotContext>;
    private logger: Logger;

    public constructor(public readonly config: AppConfig) {
        this.logger = new Logger();
        this.telegraf = new Telegraf<BotContext>(config.tg.token).use(
            async (ctx, next) => {
                await extendContext(ctx, config, this.logger);
                await next();
            }
        );
        this.telegraf.context.logger = this.logger;

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
                    this.telegraf.context.logger?.info("Started Telegram bot", {
                        mode: "polling"
                    });
                    resolve();
                })
                .finally(() => {
                    this.telegraf.context.logger?.info("Stopped Telegram bot");
                });
        });
    }

    /** Stops bot. */
    public async stop(): Promise<void> {
        this.telegraf.stop();
    }
}
