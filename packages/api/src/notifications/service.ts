import { Queue } from "bullmq";
import type NotificationRepository from "./repository";
import type UserRepository from "../users/repository";
import type { AppConfig } from "../config";

export default class NotificationService {
    public constructor(
        config: AppConfig["redis"],
        private users: UserRepository,
        private notifications: NotificationRepository
    ) {
        this.queue = new Queue("telegram.send", {
            connection: { url: config.connectionString }
        });
    }

    private queue: Queue<NotificationMsgPayload>;

    /** Sends a notification to specified users. */
    public async send(text: string, users: string[]): Promise<void> {
        const id = await this.notifications.create(text);
        for (const userId of users) {
            const user = await this.users.getById(userId);
            if (!user) continue;

            const job = await this.queue.add("message", {
                notificationId: id,
                userId: user.id,
                tgChatId: user.telegram.id,
                text
            });
        }
    }
}

export type NotificationMsgPayload = {
    notificationId: string;
    userId: string;
    tgChatId: string;
    text: string;
};
