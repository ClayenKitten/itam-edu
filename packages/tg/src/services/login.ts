import api from "../api.js";
import { env } from "process";
import type { MyMsgContext } from "../middlewares/ctx.js";

export default async function handleLogin(ctx: MyMsgContext) {
    if (!ctx.from.username) {
        await ctx.reply("Please set Telegram username");
        return;
    }

    const msg = await ctx.reply(getMessage(ctx.from.username), {
        parse_mode: "HTML"
    });
    await new Promise(r => setTimeout(r, 2000));

    const loginResult = await login({
        tgChatId: `${ctx.chat.id}`,
        tgUserId: `${ctx.from.id}`,
        tgUsername: ctx.from.username
    });
    if (!loginResult.success) {
        ctx.logger.error("Login Failed", { error: loginResult.error });
    }

    await ctx.telegram.editMessageText(
        ctx.chat.id,
        msg.message_id,
        undefined,
        getMessage(ctx.from.username, loginResult),
        {
            parse_mode: "HTML",
            reply_markup: getKeyboard(loginResult)
        }
    );
}

async function login(data: {
    tgChatId: string;
    tgUserId: string;
    tgUsername: string;
}): Promise<LoginResult> {
    try {
        const response = await api().bot.login.post({ ...data });
        if (response.error) {
            return { success: false, error: { status: response.status } };
        }
        const { code, expires } = response.data;
        return { success: true, code, expires: new Date(expires) };
    } catch (error) {
        return { success: false, error };
    }
}

function getMessage(username: string, loginResult?: LoginResult) {
    let header = `<b>Welcome back, ${username}!</b>`;
    let status = loginResult ? (loginResult.success ? "✅" : "🚫") : "⏳";

    if (!loginResult) {
        return `${header}\n\n` + `${status} Your code is: <code>...</code>`;
    } else if (loginResult.success) {
        return (
            `${header}\n\n` +
            `${status} Your code is: <code>${loginResult.code}</code>\n\n` +
            `Expires in ${minutesBefore(loginResult.expires)} minutes`
        );
    } else {
        return (
            `${header}\n\n` +
            `${status} Sorry, we could not log you in due to an unexpected error\n\n` +
            `Please, try again later. If the problem persists, please contact @${env.ITAM_EDU_TG_SUPPORT_USERNAME}.`
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
                    url: `${env.ITAM_EDU_TG_WEB_URL!}/signin?code=${loginResult.code}`
                }
            ]
        ]
    };
}

type LoginResult =
    | { success: true; code: string; expires: Date }
    | { success: false; error: unknown };

const minutesBefore = (before: Date) =>
    Math.ceil((before.getTime() - new Date().getTime()) / 60000);
