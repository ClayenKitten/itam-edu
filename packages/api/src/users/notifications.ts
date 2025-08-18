import {
    NotificationTemplate,
    type TelegramNotification
} from "../notifications";
import { container } from "..";
import type { AppConfig } from "itam-edu-common/config";

export class LoginNotificationTemplate extends NotificationTemplate {
    public constructor() {
        super();
    }

    public toWeb(id: string, _userId: string): null {
        return null;
    }

    public toTelegram(id: string, _userId: string): TelegramNotification {
        return {
            id,
            html: this.html,
            link: null
        };
    }

    public get html() {
        const config: AppConfig = container.get("AppConfig");
        return [
            `<b>🔐 Новый вход в платформу ITAM Education</b>`,
            `Это не вы? Напишите @${config.telegram.supportUsername}!`
        ].join("\n\n");
    }
}
