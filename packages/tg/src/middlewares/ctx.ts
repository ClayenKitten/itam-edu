import type { Context, NarrowedContext } from "telegraf";
import type { Logger } from "winston";
import logger from "../logger.js";
import type { Message, Update } from "telegraf/types";

export async function contextMiddleware(
    ctx: MyContext,
    next: () => Promise<void>
) {
    ctx.logger = logger.child({
        username: ctx.from?.username,
        userId: ctx.from?.id,
        chatId: ctx.chat?.id
    });
    await next();
}

export interface MyContext<T extends Update = Update> extends Context<T> {
    logger: Logger;
}

export type MyMsgContext = NarrowedContext<
    MyContext,
    Update.MessageUpdate<Message.TextMessage>
>;
