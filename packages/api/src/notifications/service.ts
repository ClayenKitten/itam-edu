import { injectable } from "inversify";
import { UserRepository } from "../users/repository";
import { TelegramSender } from "../telegram/sender";

@injectable()
export class NotificationService {
    public constructor(
        protected userRepo: UserRepository,
        protected telegramSender: TelegramSender
    ) {}

    /** Sends a notification to specified users. */
    public async send(text: string, users: string[]): Promise<void> {
        for (const userId of users) {
            const user = await this.userRepo.getById(userId);
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
