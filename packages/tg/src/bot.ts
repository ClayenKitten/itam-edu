import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import logger from "./logger.js";
import { env } from "process";
import api from "./api.js";
import { contextMiddleware, type MyContext } from "./middlewares/ctx.js";
import { loggerMiddleware } from "./middlewares/logger.js";

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
            await ctx.reply(Bot.HELP_MESSAGE, { parse_mode: "MarkdownV2" });
        });

        this.telegraf.help(async ctx => {
            await ctx.reply(Bot.HELP_MESSAGE, { parse_mode: "MarkdownV2" });
        });

        this.telegraf.command("login", async ctx => {
            if (!ctx.from.username) {
                await ctx.reply("Please set Telegram username");
                return;
            }

            const msg = await ctx.reply("Your code is being created... ⏳");
            await new Promise(r => setTimeout(r, 2000));

            const response = await api().bot.login.$post({
                json: {
                    tgChatId: ctx.chat.id.toString(),
                    tgUserId: ctx.from.id.toString(),
                    tgUsername: ctx.from.username
                }
            });
            if (response.status !== 200) {
                await ctx.reply("Oups\\! Something went wrong.");
                return;
            }
            const { code, expires } = await response.json();

            const minutesRemaining = Math.ceil(
                (new Date(expires).getTime() - new Date().getTime()) / 60000
            );

            await ctx.telegram.editMessageText(
                ctx.chat.id,
                msg.message_id,
                undefined,
                [
                    "✅ Your code is:",
                    `\n<code>${code}</code>\n`,
                    `The code expires in ${minutesRemaining} minutes.`
                ].join("\n"),
                { parse_mode: "HTML" }
            );
        });

        this.telegraf.on(message("text"), async ctx => {
            await ctx.reply(Bot.HELP_MESSAGE, { parse_mode: "MarkdownV2" });
        });
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

    public static readonly HELP_MESSAGE = [
        "*ITAM\\.Education Bot 🎒*",
        "",
        "Companion bot for [ITAM\\.Education platform](https://edu.itatmisis.ru)\\.",
        "",
        "*Commands 💬*",
        "/login \\- login into the web app",
        "",
        "*Features ✅*",
        "\\- Login into the platform",
        "\\- Receive notifications",
        "\\- More in the future?",
        "",
        "*Contacts ☎️*",
        "@ClayenKitten"
    ].join("\n");
}
