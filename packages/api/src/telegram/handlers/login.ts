import { randomInt } from "crypto";
import type { BotMsgContext } from "../ctx";
import logger from "../../logger";

export default async function handleLogin(ctx: BotMsgContext) {
    if (!ctx.from.username) {
        await ctx.reply("Please set Telegram username");
        return;
    }
    const loginResult = await login({
        tgChatId: `${ctx.chat.id}`,
        tgUserId: `${ctx.from.id}`,
        tgUsername: ctx.from.username
    });
    if (!loginResult.success) {
        logger.error("Login failed", { error: loginResult.error });
    } else {
        logger.debug("Login code generated");
    }
    await ctx.reply(getMessage(loginResult), {
        parse_mode: "HTML",
        reply_markup: getKeyboard(loginResult)
    });
    return;

    async function login(data: {
        tgChatId: string;
        tgUserId: string;
        tgUsername: string;
    }): Promise<LoginResult> {
        try {
            const codeLength = 8;
            const codeRadix = 16;
            const code = randomInt(0, codeRadix ** codeLength)
                .toString(codeRadix)
                .padStart(codeLength, "0")
                .toUpperCase();

            const expiresAfterMinutes = 5;
            const expires = new Date(
                new Date().getTime() + expiresAfterMinutes * 60000
            );

            const success = await ctx.db.user.createLoginAttempt({
                code,
                expires,
                ...data
            });

            if (!success) {
                return { success: false };
            }
            return { success: true, code, expires: new Date(expires) };
        } catch (error) {
            return { success: false, error };
        }
    }

    function getMessage(loginResult: LoginResult) {
        let header = `<b>Welcome back, ${ctx.from.username}!</b>`;
        let status = loginResult.success ? "✅" : "🚫";

        if (loginResult.success) {
            return (
                `${header}\n\n` +
                `${status} Your code is: <code>${loginResult.code}</code>\n\n` +
                `Expires in ${minutesBefore(loginResult.expires)} minutes`
            );
        } else {
            return (
                `${header}\n\n` +
                `${status} Sorry, we could not log you in due to an unexpected error\n\n` +
                `Please, try again later. If the problem persists, please contact @${ctx.config.tg.supportUsername}.`
            );
        }
    }

    function getKeyboard(loginResult: LoginResult) {
        if (!loginResult.success) return undefined;
        return {
            inline_keyboard: [
                [
                    {
                        text: "Login",
                        url: `${ctx.config.webUrl}?window=login&code=${loginResult.code}`
                    }
                ]
            ]
        };
    }
}

type LoginResult =
    | { success: true; code: string; expires: Date }
    | { success: false; error?: unknown };

const minutesBefore = (before: Date) =>
    Math.ceil((before.getTime() - new Date().getTime()) / 60000);
