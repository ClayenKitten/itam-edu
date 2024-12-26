import { Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import type { Update } from "telegraf/types";
import logger from "./logger.js";
import { env } from "process";

export default class Bot {
    private telegraf: Telegraf<Context<Update>>;

    public get tg() {
        return this.telegraf.telegram;
    }

    public constructor(token: string) {
        this.telegraf = new Telegraf(token);
        if (env.NODE_ENV === "production") {
            process.once("SIGINT", () => this.telegraf.stop("SIGINT"));
            process.once("SIGTERM", () => this.telegraf.stop("SIGTERM"));
        }

        this.telegraf.start(async ctx => {
            await ctx.reply(Bot.HELP_MESSAGE, { parse_mode: "MarkdownV2" });
        });

        this.telegraf.help(async ctx => {
            await ctx.reply(Bot.HELP_MESSAGE, { parse_mode: "MarkdownV2" });
        });

        this.telegraf.command("login", async ctx => {
            const code = ctx.args.at(0);
            if (!code) {
                await ctx.reply("Please provide login code.");
                return;
            }
            await ctx.reply(`Login \`${code}\``);
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
        "*ITAM.Education Bot 🎒*",
        "",
        "Companion bot for [ITAM.Education platform](https://clayenkitten.dev)\\.",
        "",
        "*Commands 💬*",
        "\\- `/login CODE` \\- login into web app with provided code",
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
