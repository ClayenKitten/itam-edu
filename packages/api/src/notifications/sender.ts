import { inject, injectable } from "inversify";
import { UserRepository } from "../users/repository";
import { TelegramBot } from "../telegram";
import type { AppConfig } from "itam-edu-common/config";
import { Redis } from "../infra/redis";
import type {
    NotificationTemplate,
    TelegramNotification,
    WebNotification
} from ".";
import logger from "../logger";
import { randomUUID } from "node:crypto";

@injectable()
export class NotificationSender {
    public constructor(
        @inject("AppConfig")
        protected config: AppConfig,
        protected userRepo: UserRepository,
        protected telegramBot: TelegramBot,
        protected redis: Redis
    ) {}

    /** Sends a notification to specified users. */
    public async send(
        template: NotificationTemplate,
        userIds: ReadonlyArray<string>
    ): Promise<void> {
        for (const userId of userIds) {
            try {
                const id = randomUUID();
                const [webNotification, telegramNotification] =
                    await Promise.all([
                        template.toWeb(id, userId),
                        template.toTelegram(id, userId)
                    ]);
                await Promise.all([
                    webNotification && this.sendWeb(userId, webNotification),
                    telegramNotification &&
                        this.sendTelegram(userId, telegramNotification)
                ]);
            } catch (error) {
                logger.warning("Failed to send notification", { error });
            }
        }
    }

    protected async sendWeb(
        userId: string,
        webNotification: WebNotification
    ): Promise<void> {
        await this.redis.xAdd(
            `notifications:${userId}`,
            "*",
            {
                payload: JSON.stringify(webNotification)
            },
            {
                TRIM: {
                    strategy: "MAXLEN",
                    strategyModifier: "~",
                    threshold: 100
                }
            }
        );
    }

    protected async sendTelegram(
        userId: string,
        telegramNotification: TelegramNotification
    ): Promise<void> {
        // TODO: refactor telegram.send to accept just an id
        const user = await this.userRepo.getById(userId);
        if (!user) return;

        await this.telegramBot.send(
            user,
            telegramNotification.html,
            telegramNotification.link
        );
    }
}
