import { injectable } from "inversify";
import { Queue } from "bullmq";
import { AppConfig } from "../config";
import { queues, User } from "itam-edu-common";

@injectable()
export class TelegramSender {
    public constructor(config: AppConfig) {
        this.queue = new Queue(queues.telegram.OUTBOUND_PRIVATE_MESSAGE_QUEUE, {
            connection: { url: config.redis.connectionString }
        });
    }

    protected queue: Queue<queues.telegram.OutboundPrivateMessage>;

    public async send(user: User, text: string) {
        await this.queue.add("message", { chatId: user.telegram.id, text });
    }
}
