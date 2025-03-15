import type { Telegraf } from "telegraf";
import type { BotContext } from "../ctx";
import { message } from "telegraf/filters";

import handleLogin from "./login";
import handleHelp from "./help";
import logger from "../../logger";

export default function setupHandlers(telegraf: Telegraf<BotContext>) {
    telegraf.catch(async (error, ctx) => {
        logger.error("Unhandled Exception", { error });
        try {
            await ctx.reply("🚫 Упс! Произошла неожиданная ошибка!");
        } catch {}
    });

    telegraf.start(async ctx => {
        if (ctx.payload === "login") {
            try {
                await ctx.deleteMessage(ctx.message.message_id);
            } catch {}
            await handleLogin(ctx);
        } else {
            await handleHelp(ctx);
        }
    });

    telegraf.command("login", async ctx => await handleLogin(ctx));
    telegraf.on(message("text"), async ctx => await handleHelp(ctx));
}
