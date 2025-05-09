import { Bot } from "grammy";
import type { queues } from "itam-edu-common";
import logger from "./logger";

export default class TelegramBot {
    /** Internal grammy instance. */
    protected grammy: Bot;

    public constructor(
        token: string,
        private onMessage: (
            payload: queues.telegram.InboundPrivateMessage
        ) => void | Promise<void>
    ) {
        this.grammy = new Bot(token);

        this.grammy.chatType("private").on("message:text", async msg => {
            if (!msg.from.username) {
                this.sendMessage(
                    msg.chatId.toFixed(0),
                    "Пожалуйста, укажите в Telegram свой ник, чтобы воспользоваться платформой."
                );
                return;
            }
            let payload: queues.telegram.InboundPrivateMessage = {
                text: msg.message.text,
                sender: {
                    id: msg.from.id.toFixed(0),
                    firstName: msg.from.first_name,
                    lastName: msg.from.last_name ?? null,
                    username: msg.from.username
                }
            };
            logger.debug("Inbound message received", {
                sender: payload.sender,
                text: payload.text
            });
            await this.onMessage(payload);
            logger.debug("Inbound message sent to the queue", {
                sender: payload.sender
            });
        });
    }

    /**
     * Starts bot in polling mode.
     *
     * @returns A promise that will only resolve if the bot stops.
     * */
    public async start(): Promise<void> {
        await this.grammy
            .start({
                onStart: () => {
                    logger.info("Started Telegram bot");
                }
            })
            .finally(() => {
                logger.info("Stopped Telegram bot");
            });
    }

    /** Sends a text message to the specified chat. */
    public async sendMessage(chatId: string, text: string) {
        logger.debug("Outbound message received", { chatId, text });
        this.grammy.api.sendMessage(chatId, text, { parse_mode: "HTML" });
        logger.debug("Outbound message sent to user", { chatId, text });
    }
}
