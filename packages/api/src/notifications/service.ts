import type UserRepository from "../users/repository";
import type { TelegramSender } from "../telegram/sender";

export default class NotificationService {
    public constructor(
        private db: { user: UserRepository },
        protected telegramSender: TelegramSender
    ) {}

    /** Sends a notification to specified users. */
    public async send(text: string, users: string[]): Promise<void> {
        for (const userId of users) {
            const user = await this.db.user.getById(userId);
            if (!user) continue;
            await this.telegramSender.send(user, text);
        }
    }
}

export type NotificationMsgPayload = {
    notificationId: string;
    userId: string;
    tgChatId: string;
    text: string;
};
