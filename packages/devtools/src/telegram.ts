import { MessagePublisher, MessageWorker } from "itam-edu-api/src/infra/queue";
import type { AppConfig } from "itam-edu-common/config";
import type { Message } from "./db";
import logger from "itam-edu-api/src/logger";
import {
    BotCommandQueueKind,
    BotEventQueueKind,
    type BotCommand,
    type BotEvent
} from "itam-edu-api/src/bot";

export class FakeTelegramBot {
    private publisher: MessagePublisher<BotEvent>;
    private worker: MessageWorker<BotCommand>;

    public constructor(
        config: AppConfig,
        private addMessage: (chatId: string, msg: Message) => void
    ) {
        this.publisher = new MessagePublisher(
            config.redis.connectionString,
            BotEventQueueKind
        );
        this.worker = new MessageWorker(
            config.redis.connectionString,
            BotCommandQueueKind,
            async (_jobName, payload) => await this.handleCommand(payload)
        );
    }

    /** Starts bot in polling mode. */
    public async start(): Promise<void> {
        logger.warning("Fake Telegram bot started");
        await this.worker.start();
    }

    /** Stops bot. */
    public async stop(): Promise<void> {
        await this.worker.stop();
    }

    private async handleCommand({ chatId, msg: { text, link } }: BotCommand) {
        if (link && link.url.includes("localhost")) {
            text += `\n\n<a href="${link.url}" target="_blank">${link.text}</a>`;
        }

        this.addMessage(chatId, {
            author: "bot",
            text,
            sentAt: new Date()
        });
    }

    public async sendUserMessage(chatId: string, userId: string, text: string) {
        await this.publisher.publish({
            kind: "PrivateMessage",
            chatId,
            userId,
            msg: {
                text
            }
        });

        this.addMessage(chatId, {
            author: "user",
            text,
            sentAt: new Date()
        });
    }
}
