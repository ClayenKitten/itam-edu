import { env } from "process";
import type { MyMsgContext } from "../middlewares/ctx.js";

export default async function handleHelp(ctx: MyMsgContext) {
    await ctx.reply(HELP_MESSAGE, { parse_mode: "HTML" });
}

const HELP_MESSAGE: string = [
    "<b>ITAM.Education Bot 🎒</b>",
    "",
    `Companion bot for <a href="${env.ITAM_EDU_TG_WEB_URL}">ITAM.Education Platform</a>.`,
    "",
    "<b>Commands 💬</b>",
    "/login - login into the web app",
    "",
    "<b>Features ✅</b>",
    "- Web platform login",
    "- Notifications",
    "",
    "<b>Contacts ☎️</b>",
    `@${env.ITAM_EDU_TG_SUPPORT_USERNAME}`
].join("\n");
