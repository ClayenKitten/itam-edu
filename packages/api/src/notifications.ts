import { inject, injectable } from "inversify";
import { UserRepository } from "./users/repository";
import { TelegramBot } from "./telegram";
import type { AppConfig } from "itam-edu-common/config";

export abstract class Notification {
    /** Ids of users to whom the notification should be sent. */
    public abstract readonly audience: string | ReadonlyArray<string>;

    /** HTML representation of the notification. */
    public abstract readonly html: string;

    /**
     * Returns optional links attached to the message.
     *
     * Internal links should start with a slash (`/`).
     * */
    public get link(): NotificationLink | null {
        return null;
    }
}

export type NotificationLink = {
    text: string;
    url: string;
};

@injectable()
export class NotificationSender {
    public constructor(
        @inject("AppConfig")
        protected config: AppConfig,
        protected userRepo: UserRepository,
        protected telegramBot: TelegramBot
    ) {}

    /** Sends a notification to specified users. */
    public async send(notification: Notification): Promise<void> {
        const audience = Array.isArray(notification.audience)
            ? notification.audience
            : [notification.audience];
        const link = notification.link
            ? this.toFullUrl(notification.link)
            : undefined;

        for (const userId of audience) {
            const user = await this.userRepo.getById(userId);
            if (!user) continue;
            await this.telegramBot.send(user, notification.html, link);
        }
    }

    private toFullUrl(link: NotificationLink): NotificationLink {
        if (link.url.startsWith("/")) {
            link.url = "https://" + this.config.server.hostname + link.url;
        }
        return link;
    }
}
