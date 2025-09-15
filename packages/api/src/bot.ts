import { inject, injectable } from "inversify";
import type { User } from "itam-edu-common";
import type { AppConfig } from "itam-edu-common/config";
import { MessagePublisher, MessageWorker } from "./infra/queue";
import {
    TgInboundQueueConfig,
    TgOutboundQueueConfig,
    type TgInboundEvent,
    type TgOutboundEvent
} from "./infra/telegram/queues";
import { UserRepository } from "./users/repository";
import { UserLogin } from "./users/login";
import { TelegramBot } from "./infra/telegram";
import logger from "./logger";

/**
 * Handles bot communication.
 *
 * This service is only responsible for message handling. Connection to Telegram
 * Bot API is handled by {@link TelegramBot}.
 */
@injectable()
export class BotService {
    private publisher: MessagePublisher<TgOutboundEvent>;
    private worker: MessageWorker<TgInboundEvent>;

    public constructor(
        @inject("AppConfig")
        private config: AppConfig,
        private userRepo: UserRepository,
        private login: UserLogin
    ) {
        this.publisher = new MessagePublisher(
            config.redis.connectionString,
            TgOutboundQueueConfig
        );
        this.worker = new MessageWorker(
            config.redis.connectionString,
            TgInboundQueueConfig,
            async (_jobName, { chatId, userId, msg }) => {
                const reply = await this.handle(userId, msg);
                if (reply === null) return;
                await this.publisher.publish({
                    chatId,
                    msg: reply
                });
            }
        );
    }

    public async start() {
        await this.worker.start();
        logger.info("Started bot service");
    }
    public async stop() {
        await this.worker.stop();
        logger.info("Stopped bot service");
    }

    private async handle(
        userId: string,
        msg: InboundBotMessage
    ): Promise<OutboundBotMessage | null> {
        const user = await this.userRepo.getById(userId);
        if (!user) {
            logger.error("Incorrect user id in the message queue", {
                queue: TgInboundQueueConfig.queueName,
                userId
            });
            return null;
        }

        const text = msg.text.trim();
        if (text.startsWith("/login")) {
            return await this.handleLogin(user);
        } else {
            return await this.handleHelp();
        }
    }

    private async handleLogin(user: User): Promise<OutboundBotMessage> {
        const code = await this.login.requestCode(user);
        const expiresInMinutes = Math.ceil(
            this.login.CODE_EXPIRATION_SECONDS / 60
        );
        return {
            text: [
                `<b>Привет, ${user.telegram.username}!</b>`,
                `✅ Код для входа: <code>${code}</code>`,
                `Истекает через ${expiresInMinutes} минут`
            ].join("\n\n"),
            link: {
                text: "🔗 Войти",
                url: `${this.config.server.origin}/home?login=${code}`
            }
        };
    }

    private async handleHelp(): Promise<OutboundBotMessage> {
        return {
            text: [
                "<b>ITAM Education 🎒</b>",
                "",
                `Бот-компаньон для <a href="${this.config.server.origin}">образовательной платформы ITAM Education</a>.`,
                "",
                "<b>💬 Команды</b>",
                "/login - получить код для входа на платформу",
                "",
                "<b>☎️ Поддержка</b>",
                `@${this.config.telegram.supportUsername}`
            ].join("\n")
        };
    }
}

/** Message that was received by the bot. */
export type InboundBotMessage = {
    text: string;
};

/** Message that should be sent by the bot. */
export type OutboundBotMessage = {
    /** Text of the message with HTML formatting. */
    text: string;
    /** Optional link to some content. */
    link?: {
        text: string;
        /**
         * URL of the content.
         *
         * URLs without origin are supported and will be resolved via configured platform origin.
         *
         * @example
         * `https://example.com`
         *
         * @example
         * `/home`
         * */
        url: string;
    };
};
