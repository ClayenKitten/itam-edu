import logger from "../../logger";
import type { BotMsgContext } from "../ctx";

export default async function handleHelp(ctx: BotMsgContext) {
    const {
        webUrl,
        tg: { supportUsername }
    } = ctx.config;

    const HELP_MESSAGE: string = [
        "<b>ITAM Education Bot 🎒</b>",
        "",
        `Companion bot for <a href="${webUrl}">ITAM Education Platform</a>.`,
        "",
        "<b>Commands 💬</b>",
        "/login - login into the web app",
        "",
        "<b>Features ✅</b>",
        "- Web platform login",
        "- Notifications",
        "",
        "<b>Contacts ☎️</b>",
        `@${supportUsername}`
    ].join("\n");

    logger.debug("Replied with help");
    await ctx.reply(HELP_MESSAGE, { parse_mode: "HTML" });
}
