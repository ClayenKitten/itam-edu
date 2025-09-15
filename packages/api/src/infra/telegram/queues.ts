import type { QueueConfig } from "../queue";
import type { InboundBotMessage, OutboundBotMessage } from "../../bot";

/** User sent a message to the bot in a private chat. */
export type TgInboundEvent = {
    chatId: string;
    userId: string;
    msg: InboundBotMessage;
};
export const TgInboundQueueConfig: QueueConfig<TgInboundEvent> = {
    queueName: "tg.inbound.private-message" as const
};

/** Server sent a message to a chat. */
export type TgOutboundEvent = {
    chatId: string;
    msg: OutboundBotMessage;
};
export const TgOutboundQueueConfig: QueueConfig<TgOutboundEvent> = {
    queueName: "tg.outbound.message" as const
};
