import { setTimeout } from "timers/promises";
import type AppConfig from "../config";
import Database from "../db";
import Logger from "../logger";
import type TelegramBot from "../telegram";

/** Worker for sending notifications. */
export default class NotificationWorker {
    private db: Database;
    private logger: Logger;

    public constructor(
        private config: AppConfig,
        private bot: TelegramBot
    ) {
        this.logger = new Logger();
        this.db = new Database(this.config.db.connectionString, this.logger);
    }

    public async start(): Promise<void> {
        const limit = 30;
        this.logger.info("Started notifications worker");
        while (true) {
            this.logger.trace("Sending pending notifications");
            const pending = await this.db.notification.getUnsent(limit);
            await Promise.allSettled(
                pending.map(async msg => {
                    try {
                        await this.bot.sendMessage(msg.tgChatId, msg.text, {
                            parse_mode: "HTML"
                        });
                        await this.db.notification.markAsSent(
                            msg.id,
                            msg.userId
                        );
                    } catch (error) {
                        this.logger.error("Failed to send notificatiton", {
                            messageId: msg.id,
                            error: (error as any).message
                        });
                    }
                })
            );
            await setTimeout(5000);
        }
    }
}
