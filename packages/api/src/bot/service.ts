import { inject, injectable } from "inversify";
import type { User } from "itam-edu-common";
import type { AppConfig } from "itam-edu-common/config";
import { MessagePublisher, MessageWorker } from "../infra/queue";
import {
    BotCommandQueueKind,
    type BotCommand,
    BotEventQueueKind,
    type BotEvent,
    type OutboundBotMessage
} from ".";
import { UserRepository } from "../users/repository";
import { UserLogin } from "../users/login";
import { TelegramBot } from "../infra/telegram";
import logger from "../logger";
import { ApplyAttendanceToken } from "../courses/lesson/attendance/token/apply.interactor";
import { AppError } from "../errors";

/**
 * Handles bot communication.
 *
 * This service is only responsible for message handling. Connection to Telegram
 * Bot API is handled by {@link TelegramBot}.
 */
@injectable()
export class BotService {
    private publisher: MessagePublisher<BotCommand>;
    private worker: MessageWorker<BotEvent>;

    public constructor(
        @inject("AppConfig")
        private config: AppConfig,
        private userRepo: UserRepository,
        private login: UserLogin,
        private applyAttendanceToken: ApplyAttendanceToken
    ) {
        this.publisher = new MessagePublisher(
            config.redis.connectionString,
            BotCommandQueueKind
        );
        this.worker = new MessageWorker(
            config.redis.connectionString,
            BotEventQueueKind,
            async (_jobName, event) => {
                const commands = await this.handleEvent(event);
                for (const command of commands) {
                    await this.publisher.publish(command);
                }
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

    private async handleEvent(event: BotEvent): Promise<BotCommand[]> {
        const user = await this.userRepo.getById(event.userId);
        if (!user) {
            logger.error("Incorrect user id in the message queue", {
                queue: BotEventQueueKind,
                event
            });
            return [];
        }

        switch (event.kind) {
            case "PrivateMessage": {
                const text = event.msg.text.trim();
                let reply: OutboundBotMessage | null = null;
                if (text.startsWith("/login")) {
                    reply = await this.handleLogin(user);
                } else if (text.startsWith("/attend")) {
                    const token = text.replace("/attend ", "").trim();
                    reply = await this.handleAttend(user, token);
                } else {
                    reply = await this.handleHelp();
                }
                return [
                    {
                        kind: "SendMessage",
                        chatId: user.telegram.id,
                        msg: reply
                    }
                ];
            }
            default: {
                let guard: never = event.kind;
                logger.error("Unknown BotEvent kind", {
                    queue: BotEventQueueKind,
                    event
                });
                return [];
            }
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
                url: `${this.config.server.origin}?login=${code}`
            }
        };
    }

    private async handleAttend(
        actor: User,
        token: string
    ): Promise<OutboundBotMessage> {
        try {
            await this.applyAttendanceToken.invoke(actor, token);
            return {
                text: [
                    "<b>Посещение занятия отмечено ✨</b>",
                    "Спасибо, что вы с нами!"
                ].join("\n\n")
            };
        } catch (e) {
            if (e instanceof AppError) {
                logger.debug("Failed to record attendance", {
                    error: e
                });
                return {
                    text: [
                        "<b>Не удалось отметить посещение 😥</b>",
                        e.message
                    ].join("\n\n")
                };
            } else {
                logger.error("Failed to record attendance", {
                    error: e
                });
                return {
                    text: "Не удалось отметить посещение 😥"
                };
            }
        }
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
