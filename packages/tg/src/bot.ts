import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import logger from "./logger.js";
import { env } from "process";
import { contextMiddleware, type MyContext } from "./middlewares/ctx.js";
import { loggerMiddleware } from "./middlewares/logger.js";

import handleLogin from "./services/login.js";
import handleHelp from "./services/help.js";

export default class Bot {
    private telegraf: Telegraf<MyContext>;

    public get tg() {
        return this.telegraf.telegram;
    }

    public constructor(token: string) {
        this.telegraf = new Telegraf(token);
        if (env.NODE_ENV === "production") {
            process.once("SIGINT", () => this.telegraf.stop("SIGINT"));
            process.once("SIGTERM", () => this.telegraf.stop("SIGTERM"));
        }

        this.telegraf.use(contextMiddleware);
        this.telegraf.on(message("text"), (c, next) =>
            loggerMiddleware(c, next)
        );
        this.telegraf.catch(async (error, ctx) => {
            ctx.logger.error("Unhandled Exception", { error });
            try {
                await ctx.reply("🚫 Sorry, an unexpected error occurred!");
            } catch {}
        });

        this.telegraf.start(async ctx => {
            if (ctx.payload === "login") {
                try {
                    await ctx.deleteMessage(ctx.message.message_id);
                } catch {}
                await handleLogin(ctx);
            } else {
                await handleHelp(ctx);
            }
        });

        this.telegraf.command("login", async ctx => await handleLogin(ctx));
        this.telegraf.on(message("text"), async ctx => await handleHelp(ctx));
    }

    public launch(config: Telegraf.LaunchOptions = {}): Promise<void> {
        return new Promise(resolve => {
            this.telegraf.launch(config, () => {
                if (config.webhook === undefined) {
                    logger.notice("Started Telegram bot via pooling");
                } else {
                    logger.notice(
                        `Started Telegram bot via webhook at ${config.webhook.domain}:${config.webhook.port}`
                    );
                }
                resolve();
            });
        });
    }
}
