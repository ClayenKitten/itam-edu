import { inject, injectable } from "inversify";
import { UserRepository } from "../users/repository";
import type { AppConfig } from "itam-edu-common/config";
import { Redis } from "../infra/redis";
import type { NotificationTemplate, WebNotification } from ".";
import logger from "../logger";
import { randomUUID } from "node:crypto";
import type { InboundBotMessage } from "../bot";
import { MessagePublisher } from "../infra/queue";
import {
    TgOutboundQueueConfig,
    type TgOutboundEvent
} from "../infra/telegram/queues";

@injectable()
export class NotificationSender {
    public constructor(
        @inject("AppConfig")
        protected config: AppConfig,
        protected userRepo: UserRepository,
        protected redis: Redis
    ) {
        this.telegramPublisher = new MessagePublisher(
            config.redis.connectionString,
            TgOutboundQueueConfig
        );
    }

    private telegramPublisher: MessagePublisher<TgOutboundEvent>;

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
        msg: InboundBotMessage
    ): Promise<void> {
        const user = await this.userRepo.getById(userId);
        if (!user) return;

        await this.telegramPublisher.publish({
            chatId: user.telegram.id,
            msg
        });
    }
}
