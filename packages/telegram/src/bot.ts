import { Bot as Grammy } from "grammy";
import { queues } from "itam-edu-common";
import logger from "./logger";
import { Queue, Worker } from "bullmq";
import { env } from "process";
import type { User as TgUser } from "grammy/types";

export default class TelegramBot {
    protected grammy: Grammy;
    protected queue: Queue<queues.telegram.InboundPrivateMessage>;
    protected worker: Worker<queues.telegram.OutboundPrivateMessage>;

    public constructor(token: string) {
        this.grammy = new Grammy(token);

        const connection = { url: env.ITAMEDU_REDIS_CONNECTION_STRING! };
        this.queue = new Queue(queues.telegram.INBOUND_PRIVATE_MESSAGE_QUEUE, {
            connection
        });
        this.worker = new Worker(
            queues.telegram.OUTBOUND_PRIVATE_MESSAGE_QUEUE,
            async job =>
                this.onOutboundMessage(
                    job.data.chatId,
                    job.data.text,
                    job.data.link
                ),
            { connection, autorun: false }
        );

        this.grammy.chatType("private").use(async (ctx, next) => {
            if (!ctx.from.username) {
                ctx.reply(
                    "Пожалуйста, укажите в Telegram свой ник, чтобы воспользоваться платформой."
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

    /**
     * Starts bot in polling mode.
     *
     * @returns A promise that will only resolve if the bot stops.
     * */
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

        const grammy = this.grammy
            .start({
                onStart: () => {
                    logger.info("Started Telegram bot");
                }
            })
            .finally(() => {
                logger.info("Stopped Telegram bot");
            });

        this.worker.waitUntilReady().then(() => {
            logger.info("Started BullMQ worker");
        });
        const worker = this.worker.run().then(() => {
            logger.info("Stopped BullMQ worker");
        });

        await Promise.all([grammy, worker]);
    }

    /** Sends a text message to the specified chat. */
    protected async onOutboundMessage(
        chatId: string,
        text: string,
        link: { text: string; url: string } | null = null
    ) {
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
        let payload: queues.telegram.InboundPrivateMessage = {
            sender: {
                id: sender.id.toFixed(0),
                firstName: sender.first_name,
                lastName: sender.last_name ?? null,
                username: sender.username!
            },
            text
        };
        await this.queue.add("message", payload);
        logger.debug("Inbound message sent to the queue", {
            sender: payload.sender,
            text
        });
    }
}
