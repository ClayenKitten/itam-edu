import { injectable } from "inversify";
import { Queue } from "bullmq";
import { queues, User } from "itam-edu-common";
import { Redis } from "../infra/redis";

@injectable()
export class TelegramSender {
    public constructor(redis: Redis) {
        this.queue = new Queue(queues.telegram.OUTBOUND_PRIVATE_MESSAGE_QUEUE, {
            connection: redis.createConnection()
        });
    }

    protected queue: Queue<queues.telegram.OutboundPrivateMessage>;

    public async send(
        user: User,
        text: string,
        link?: { text: string; url: string }
    ) {
        await this.queue.add("message", {
            chatId: user.telegram.id,
            text,
            link
        });
    }
}
