import Logger from "../logger";
import Database from "../db";
import type { Context, NarrowedContext } from "telegraf";
import type { Message, Update } from "telegraf/types";
import type AppConfig from "../config";
import { randomUUID } from "crypto";

export async function extendContext<T extends Update = Update>(
    ctx: BotContext<T>,
    config: AppConfig,
    logger: Logger
) {
    let meta: Record<string, unknown> = {};
    let info: Record<string, unknown> = {};
    if (ctx.from) {
        meta.user = ctx.from.id;
        info.username = ctx.from.username;
    }
    if (ctx.message) info.msg = ctx.message.message_id;
    if (ctx.chat) info.chat = ctx.chat.id;

    ctx.logger = logger.child({ update: randomUUID(), ...meta });
    ctx.logger.debug("Received update", info);

    ctx.config = config;
    ctx.db = new Database(config.db.connectionString, ctx.logger);
}

export type BotContext<T extends Update = Update> = Context<T> & {
    config: AppConfig;
    logger: Logger;
    db: Database;
};

export type BotMsgContext = NarrowedContext<
    BotContext,
    Update.MessageUpdate<Message.TextMessage>
>;
