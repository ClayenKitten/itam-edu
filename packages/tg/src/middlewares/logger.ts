import type { MyMsgContext } from "./ctx.js";

export async function loggerMiddleware(
    ctx: MyMsgContext,
    next: () => Promise<void>
) {
    ctx.logger?.debug("User Message", {
        text: ctx.message?.text,
        messageId: ctx.message?.message_id
    });
    await next();
}
