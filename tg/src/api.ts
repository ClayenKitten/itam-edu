import { serve, type ServerType } from "@hono/node-server";
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import logger from "./logger.js";
import type Bot from "./bot.js";

export default function startApi(
    bot: Bot,
    options?: { hostname?: string; port?: number }
) {
    let { hostname = "0.0.0.0", port = 3000 } = options ?? {};
    const app = createServer(bot);
    return serve({ fetch: app.fetch, hostname, port }, info => {
        logger.notice(
            `Started API server at http://${info.address}:${info.port}`
        );
    });
}

function createServer(bot: Bot) {
    return new Hono()
        .get("/login", zValidator("json", z.object({})))
        .post(
            "/notifications/:chatId",
            zValidator(
                "json",
                z.object({
                    text: z.string(),
                    silent: z.boolean()
                })
            ),
            zValidator(
                "param",
                z.object({
                    chatId: z.string().regex(/^\d+$/, "number expected")
                })
            ),
            async c => {
                let { chatId } = c.req.param();
                let { text, silent } = c.req.valid("json");
                try {
                    let { message_id } = await bot.tg.sendMessage(
                        Number(chatId),
                        text,
                        {
                            disable_notification: silent,
                            parse_mode: "HTML",
                            link_preview_options: { is_disabled: true }
                        }
                    );
                    return c.json({ success: true, messageId: message_id });
                } catch (e) {
                    return c.json(
                        {
                            success: false,
                            error: {
                                message: "failed to send Telegram message",
                                internal: e
                            }
                        },
                        400
                    );
                }
            }
        )
        .delete(
            "/notifications/:chatId/:messageId",
            zValidator(
                "param",
                z.object({
                    chatId: z.string().regex(/^\d+$/, "number expected"),
                    messageId: z.string().regex(/^\d+$/, "number expected")
                })
            ),
            async c => {
                let { chatId, messageId } = c.req.param();
                try {
                    await bot.tg.deleteMessage(
                        Number(chatId),
                        Number(messageId)
                    );
                    return c.json({ success: true });
                } catch (e) {
                    return c.json(
                        {
                            success: false,
                            error: {
                                message: "failed to send Telegram message",
                                internal: e
                            }
                        },
                        400
                    );
                }
            }
        );
}
