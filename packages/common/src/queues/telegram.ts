/** User sent a message to the bot in a private chat. */
export type InboundPrivateMessage = {
    text: string;
    sender: {
        id: string;
        firstName: string;
        lastName: string | null;
        username: string;
    };
};
export const INBOUND_PRIVATE_MESSAGE_QUEUE = "tg.inbound.private-message";

/** Server sent a message to a private chat. */
export type OutboundPrivateMessage = {
    chatId: string;
    text: string;
    link?: {
        text: string;
        url: string;
    };
};
export const OUTBOUND_PRIVATE_MESSAGE_QUEUE = "tg.outbound.message";
