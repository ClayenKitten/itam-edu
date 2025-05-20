import type { User } from "itam-edu-common";
import { Notification } from "../notifications";
import { container } from "..";
import { AppConfig } from "../config";

export class LoginNotification extends Notification {
    public constructor(protected user: User) {
        super();
        this.audience = this.user.id;
    }

    public readonly audience: string;

    public get html() {
        const config = container.get(AppConfig);
        return [
            `<b>🔐 Новый вход в платформу ITAM Education</b>`,
            `Это не вы? Напишите @${config.tg.supportUsername}!`
        ].join("\n\n");
    }
}
