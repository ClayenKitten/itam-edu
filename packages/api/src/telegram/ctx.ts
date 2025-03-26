import logger from "../logger";
import type { Context, NarrowedContext } from "telegraf";
import type { Message, Update } from "telegraf/types";
import { randomUUID } from "crypto";
import type { AppContext } from "../ctx";

/**
 * Adds static context from {@link AppContext} to bot update context.
 *
 * {@link ctx} is modified in-place.
 * */
export async function extendContext<T extends Update = Update>(
    ctx: BotContext<T>,
    staticCtx: AppContext
) {
    let meta: Record<string, unknown> = {};
    let info: Record<string, unknown> = {};
    if (ctx.from) {
        meta.tgUserId = ctx.from.id;
        info.username = ctx.from.username;
    }
    if (ctx.message) info.msg = ctx.message.message_id;
    if (ctx.chat) info.chat = ctx.chat.id;

    logger.extend({ update: randomUUID(), ...meta });
    logger.debug("Received update", info);

    ctx.config = staticCtx.config;
    ctx.db = staticCtx.db;
}

/** Bot context associated with update. */
export type BotContext<T extends Update = Update> = Context<T> & AppContext;

/** Narrowed bot context associated with message update. */
export type BotMsgContext = NarrowedContext<
    BotContext,
    Update.MessageUpdate<Message.TextMessage>
>;
