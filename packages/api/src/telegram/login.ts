import type { User } from "itam-edu-common";
import logger from "../logger";
import { LoginCode, LoginCodeRepository } from "../users/login";

export async function handleLogin(
    db: { loginCode: LoginCodeRepository },
    user: User
): Promise<string> {
    const loginCode = LoginCode.create(user);
    await db.loginCode.set(loginCode);
    return printMessage(user, loginCode);
}

function printMessage(user: User, loginCode: LoginCode) {
    let header = `<b>Привет, ${user.telegram.username}!</b>`;

    return (
        `${header}\n\n` +
        `✅ Код для входа: <code>${loginCode.code}</code>\n\n` +
        `Истекает через ${minutesBefore(loginCode.expires)} минут`
    );
}

const minutesBefore = (before: Date) =>
    Math.ceil((before.getTime() - new Date().getTime()) / 60000);
