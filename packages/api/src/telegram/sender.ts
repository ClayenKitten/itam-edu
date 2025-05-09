import { Queue } from "bullmq";
import type { AppConfig } from "../config";
import { queues, User } from "itam-edu-common";

export class TelegramSender {
    public constructor(config: AppConfig["redis"]) {
        this.queue = new Queue(queues.telegram.OUTBOUND_PRIVATE_MESSAGE_QUEUE, {
            connection: { url: config.connectionString }
        });
    }

    protected queue: Queue<queues.telegram.OutboundPrivateMessage>;

    public async send(user: User, text: string) {
        await this.queue.add("message", { chatId: user.telegram.id, text });
    }
}
