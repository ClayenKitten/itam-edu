import type { QueueKind } from "../infra/queue";

/** Event that should be handled by the bot. */
export type BotEvent = {
    kind: "PrivateMessage";
    chatId: string;
    userId: string;
    msg: InboundBotMessage;
};
export const BotEventQueueKind = "bot.events" as QueueKind<BotEvent>;

/** Command that should be executed by the bot. */
export type BotCommand = {
    kind: "SendMessage";
    chatId: string;
    msg: OutboundBotMessage;
};
export const BotCommandQueueKind = "bot.commands" as QueueKind<BotCommand>;

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
