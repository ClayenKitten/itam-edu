import type { User } from "itam-edu-common";
import { LoginCode, LoginCodeRepository } from "../users/login";

export async function handleLogin(
    db: { loginCode: LoginCodeRepository },
    user: User,
    webUrl: string
): Promise<string> {
    const loginCode = LoginCode.create(user);
    await db.loginCode.set(loginCode);
    return [
        `<b>Привет, ${user.telegram.username}!</b>`,
        `✅ Код для входа: <code>${loginCode.code}</code>`,
        `Истекает через ${minutesBefore(loginCode.expires)} минут`,
        `<a href="${webUrl}?login&code=${loginCode.code}">🔗 Войти</a>`
    ].join("\n\n");
}

const minutesBefore = (before: Date) =>
    Math.ceil((before.getTime() - new Date().getTime()) / 60000);
