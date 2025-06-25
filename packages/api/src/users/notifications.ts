import type { User } from "itam-edu-common";
import { Notification } from "../notifications";
import { container } from "..";
import type { AppConfig } from "itam-edu-common/config";

export class LoginNotification extends Notification {
    public constructor(protected user: User) {
        super();
        this.audience = this.user.id;
    }

    public readonly audience: string;

    public get icon() {
        return "ph-key";
    }

    public get title() {
        return `Новый вход в платформу ITAM Education`;
    }

    public get courseId() {
        return ``;
    }

    public get html() {
        const config: AppConfig = container.get("AppConfig");
        return [
            `<b>🔐 Новый вход в платформу ITAM Education</b>`,
            `Это не вы? Напишите @${config.telegram.supportUsername}!`
        ].join("\n\n");
    }
}
