import logger from "../../logger";
import type { BotMsgContext } from "../ctx";

export default async function handleHelp(ctx: BotMsgContext) {
    const {
        webUrl,
        tg: { supportUsername }
    } = ctx.config;

    const HELP_MESSAGE: string = [
        "<b>Бот ITAM Education 🎒</b>",
        "",
        `Бот-компаньон для <a href="${webUrl}">образовательной платформы ITAM Education</a>.`,
        "",
        "<b>Команды 💬</b>",
        "/login - получить код для входа на платформу",
        "",
        "<b>Поддержка ☎️</b>",
        `@${supportUsername}`
    ].join("\n");

    logger.debug("Replied with help");
    await ctx.reply(HELP_MESSAGE, { parse_mode: "HTML" });
}
