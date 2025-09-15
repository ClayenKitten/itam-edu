import { Bot as Grammy } from "grammy";
import type { User as TgUser } from "grammy/types";
import logger from "../../logger";
import { BotService } from "../../bot";
import { inject, injectable } from "inversify";
import type { AppConfig } from "itam-edu-common/config";
import { MessagePublisher, MessageWorker } from "../queue";
import {
    TgInboundQueueConfig,
    TgOutboundQueueConfig,
    type TgInboundEvent,
    type TgOutboundEvent
} from "./queues";
import { UserRepository } from "../../users/repository";

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
    private publisher: MessagePublisher<TgInboundEvent>;
    private worker: MessageWorker<TgOutboundEvent>;

    public constructor(
        @inject("AppConfig")
        config: AppConfig,
        private userRepo: UserRepository
    ) {
        this.grammy = new Grammy(config.telegram.token);

        this.publisher = new MessagePublisher(
            config.redis.connectionString,
            TgInboundQueueConfig
        );
        this.worker = new MessageWorker(
            config.redis.connectionString,
            TgOutboundQueueConfig,
            async (_jobName, payload) => await this.onOutboundMessage(payload)
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
                logger.debug("Inbound start command received", {
                    sender: ctx.from,
                    text: ctx.message.text
                });
                await this.onInboundMessage(ctx.from, "/login");
            } else {
                await next();
            }
        });

        this.grammy.chatType("private").on("message:text", async ctx => {
            logger.debug("Inbound text message received", {
                sender: ctx.from,
                text: ctx.message.text
            });
            await this.onInboundMessage(ctx.from, ctx.message.text);
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

    /** Sends a text message to the specified chat. */
    protected async onOutboundMessage({
        chatId,
        msg: { text, link }
    }: TgOutboundEvent) {
        if (link && link.url.includes("localhost")) {
            text += `\n\n<a href="${link.url}">${link.text}</a>`;
        }

        this.grammy.api.sendMessage(chatId, text, {
            parse_mode: "HTML",
            link_preview_options: link
                ? {
                      url: link.url,
                      prefer_small_media: true
                  }
                : undefined
        });
        logger.debug("Outbound message sent to user", { chatId, text });
    }

    /** Schedules inbound message into the queue. */
    protected async onInboundMessage(sender: TgUser, text: string) {
        const user = await this.userRepo.create({
            tgUserId: sender.id.toFixed(0),
            tgUsername: sender.username!,
            firstName: sender.first_name,
            lastName: sender.last_name ?? null
        });
        this.publisher.publish({
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
