import Logger from "../logger";
import Database from "../db";
import type { Context, NarrowedContext } from "telegraf";
import type { Message, Update } from "telegraf/types";
import type AppConfig from "../config";
import { randomUUID } from "crypto";

/** Adds missing fields into {@link ctx} from {@link staticCtx}, adding update-specific metadata. */
export async function extendContext<T extends Update = Update>(
    ctx: BotContext<T>,
    staticCtx: StaticBotContext
) {
    let meta: Record<string, unknown> = {};
    let info: Record<string, unknown> = {};
    if (ctx.from) {
        meta.user = ctx.from.id;
        info.username = ctx.from.username;
    }
    if (ctx.message) info.msg = ctx.message.message_id;
    if (ctx.chat) info.chat = ctx.chat.id;

    ctx.logger = staticCtx.logger.child({ update: randomUUID(), ...meta });
    ctx.logger.debug("Received update", info);

    ctx.config = staticCtx.config;
    ctx.db = new Database(staticCtx.config.db.connectionString, ctx.logger);
}

/** Global bot context that can be extended into {@link BotContext}. */
export type StaticBotContext = {
    config: AppConfig;
    logger: Logger;
    db: Database;
};

/** Bot context associated with update. */
export type BotContext<T extends Update = Update> = Context<T> &
    StaticBotContext;

/** Narrowed bot context associated with message update. */
export type BotMsgContext = NarrowedContext<
    BotContext,
    Update.MessageUpdate<Message.TextMessage>
>;
