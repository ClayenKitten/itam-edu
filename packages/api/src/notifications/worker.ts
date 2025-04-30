import logger from "../logger";
import type TelegramBot from "../telegram";
import { Worker } from "bullmq";
import type { NotificationMsgPayload } from "./service";
import type { AppConfig } from "../config";
import type NotificationRepository from "./repository";

/** Worker for sending notifications. */
export default class NotificationWorker {
    public constructor(
        config: AppConfig["redis"],
        db: { notification: NotificationRepository },
        bot: TelegramBot
    ) {
        this.worker = new Worker<NotificationMsgPayload>(
            "telegram.send",
            async job => {
                try {
                    const msg = await bot.sendMessage(
                        job.data.tgChatId,
                        job.data.text,
                        {
                            parse_mode: "HTML"
                        }
                    );
                    await db.notification.createMessage(
                        job.data.notificationId,
                        job.data.userId,
                        msg.message_id.toFixed(0)
                    );
                } catch (error) {
                    logger.error("Failed to send notificatiton", {
                        notificationId: job.data.notificationId,
                        userId: job.data.userId,
                        error: (error as any).message
                    });
                }
            },
            {
                connection: { url: config.connectionString },
                // Telegram bot API allows to send 30 messages per second.
                // We use a lower limit to account for other messages that bot may be sending.
                //
                // https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this
                limiter: { max: 10, duration: 1000 },
                autorun: false
            }
        );
    }

    private worker: Worker;

    public async start(): Promise<void> {
        this.worker.run();
        await this.worker.waitUntilReady();
        logger.info("Started notifications worker");
    }

    public async stop(): Promise<void> {
        await this.worker?.close();
        logger.info("Stopped notifications worker");
    }
}
