import { Bot as Grammy } from "grammy";
import type { User as TgUser } from "grammy/types";
import logger from "../logger";
import { BotService } from "../features/bot/service";
import { inject, injectable } from "inversify";
import type { AppConfig } from "itam-edu-common/config";
import { MessagePublisher, MessageWorker } from "./queue";
import { UserRepository } from "../features/users/repository";
import {
    BotCommandQueueKind,
    BotEventQueueKind,
    type BotCommand,
    type BotEvent
} from "../features/bot";

/**
 * Telegram bot.
 *
 * This class is responsible for communication with Telegram Bot API. Most of the
 * business logic is handled by {@link BotService}.
 *
 * Communication with {@link BotService} happens over BullMQ queues. This way we
 * can keep an audit trail of user interactions, and substitute implementation
 * with other interface e.g. devtools package.
 * */
@injectable()
export class TelegramBot {
    private grammy: Grammy;
    private publisher: MessagePublisher<BotEvent>;
    private worker: MessageWorker<BotCommand>;

    public constructor(
        @inject("AppConfig")
        private config: AppConfig,
        private userRepo: UserRepository
    ) {
        this.grammy = new Grammy(config.telegram.token);

        this.publisher = new MessagePublisher(
            config.redis.connectionString,
            BotEventQueueKind
        );
        this.worker = new MessageWorker(
            config.redis.connectionString,
            BotCommandQueueKind,
            async (_jobName, payload) => await this.onCommand(payload)
        );

        this.grammy.chatType("private").use(async (ctx, next) => {
            if (!ctx.from.username) {
                ctx.reply(
                    "Пожалуйста, укажите ник в Telegram, чтобы воспользоваться платформой.",
                    {
                        link_preview_options: {
                            // TODO: add that information to the web platform, so we don't depend on some random guide
                            url: `https://dzen.ru/a/ZLZzSY55_nT7X7Lz`
                        }
                    }
                );
                return;
            }
            await next();
        });

        this.grammy.chatType("private").command("start", async (ctx, next) => {
            if (ctx.match === "login") {
                logger.debug("Login command received via start", {
                    sender: ctx.from,
                    text: ctx.message.text
                });
                await this.onPrivateMessage(ctx.from, "/login");
            } else if (ctx.match.startsWith("attend_")) {
                const token = ctx.match.replace("attend_", "");
                logger.debug("Attend command received via start", {
                    sender: ctx.from,
                    text: ctx.message.text
                });
                await this.onPrivateMessage(ctx.from, `/attend ${token}`);
            } else {
                await next();
            }
        });

        this.grammy.chatType("private").on("message:text", async ctx => {
            logger.debug("Private message received", {
                sender: ctx.from,
                text: ctx.message.text
            });
            await this.onPrivateMessage(ctx.from, ctx.message.text);
        });
    }

    /** Starts bot in polling mode. */
    public async start(): Promise<void> {
        await this.grammy.api.setMyCommands(
            [
                {
                    command: "/login",
                    description: "Получить код для входа на платформу"
                }
            ],
            { scope: { type: "all_private_chats" } }
        );

        const grammyReady = new Promise<void>(resolve => {
            this.grammy
                .start({
                    onStart: ({ username, first_name }) => {
                        logger.info("Started Telegram bot", {
                            username,
                            displayName: first_name
                        });
                        resolve();
                    }
                })
                .catch(e => {
                    logger.error(e);
                })
                .finally(() => {
                    logger.info("Stopped Telegram bot");
                });
        });
        const workerReady = this.worker.start();

        await Promise.all([grammyReady, workerReady]);
    }

    /** Stops bot. */
    public async stop(): Promise<void> {
        await Promise.allSettled([this.grammy.stop(), this.worker.stop()]);
    }

    private async onCommand(command: BotCommand) {
        switch (command.kind) {
            case "SendMessage": {
                let {
                    chatId,
                    msg: { text, link }
                } = command;
                if (link && link.url.includes("localhost")) {
                    text += `\n\n<a href="${link.url}">${link.text}</a>`;
                }
                if (link && link.url.startsWith("/")) {
                    link.url = this.config.server.origin + link.url;
                }

                try {
                    await this.grammy.api.sendMessage(chatId, text, {
                        parse_mode: "HTML",
                        reply_markup: link
                            ? {
                                  inline_keyboard: [
                                      [
                                          {
                                              text: link.text,
                                              url: link.url
                                          }
                                      ]
                                  ]
                              }
                            : undefined,
                        link_preview_options: link
                            ? {
                                  url: link.url,
                                  prefer_small_media: true
                              }
                            : undefined
                    });
                } catch (error) {
                    logger.warning("Failed to send Telegram message", {
                        error
                    });
                    throw error;
                }
                logger.debug("Outbound message sent to user", { chatId, text });
                break;
            }
            default: {
                const _guard: never = command.kind;
                logger.error("Unknown BotCommand kind", {
                    queue: BotEventQueueKind,
                    command
                });
            }
        }
    }

    private async onPrivateMessage(sender: TgUser, text: string) {
        const user = await this.userRepo.create({
            tgUserId: sender.id.toFixed(0),
            tgUsername: sender.username!,
            firstName: sender.first_name,
            lastName: sender.last_name ?? null
        });
        await this.publisher.publish({
            kind: "PrivateMessage",
            chatId: user.telegram.id,
            userId: user.id,
            msg: {
                text
            }
        });
        logger.debug("Inbound message sent to the queue", {
            sender: user.id,
            text
        });
    }
}
