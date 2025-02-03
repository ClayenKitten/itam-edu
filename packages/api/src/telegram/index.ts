import { Context, Telegraf } from "telegraf";
import { env } from "process";

import {
    extendContext,
    type BotContext,
    type StaticBotContext
} from "./ctx.js";
import type AppConfig from "../config.js";
import Logger from "../logger.js";
import setupHandlers from "./handlers/index.js";
import Database from "../db/index.js";
import { messageSendout } from "./handlers/sendout.js";

let activeTimers = 0;

export default class TelegramBot {
    /** Internal Telegraf instance. */
    private telegraf: Telegraf<BotContext>;

    /** Static context. */
    public readonly ctx: StaticBotContext;

    public constructor(config: AppConfig) {
        const logger = new Logger();
        const db = new Database(config.db.connectionString, logger);
        this.ctx = { config, logger, db };
        this.telegraf = new Telegraf<BotContext>(config.tg.token).use(
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
                    this.ctx.logger.info("Started Telegram bot", {
                        mode: "polling"
                    });
                    this.startTimers(this.ctx, this.telegraf);
                    resolve();
                })
                .finally(() => {
                    this.ctx.logger.info("Stopped Telegram bot");
                });
        });
    }

    /** Stops bot. */
    public async stop(): Promise<void> {
        this.telegraf.stop();
    }

    /** Starts timers for tasks running on interval. */
    private async startTimers(
        ctx: StaticBotContext,
        telegraf: Telegraf<BotContext>
    ) {
        activeTimers++; // Increment when a timer starts
        console.log(`Timers running: ${activeTimers}`);

        setInterval(() => messageSendout(ctx, telegraf), 5300);
        this.ctx.logger.info("Started timer for messageSendout");
    }
}
