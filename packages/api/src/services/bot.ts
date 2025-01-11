import { Hono } from "hono";
import type { AppEnv } from "../ctx.js";
import { botAuthentication } from "../middlewares/botAuthentication.js";
import { env } from "process";
import { randomInt } from "node:crypto";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export async function botService() {
    return new Hono<AppEnv>()
        .use(botAuthentication(env.ITAM_EDU_API_BOT_TOKEN!))
        .post(
            "/login",
            zValidator(
                "json",
                z.object({
                    tgUserId: z.string(),
                    tgChatId: z.string(),
                    tgUsername: z.string()
                })
            ),
            async c => {
                const codeLength = 8;
                const codeRadix = 16;
                const code = randomInt(0, codeRadix ** codeLength)
                    .toString(codeRadix)
                    .padStart(codeLength, "0")
                    .toUpperCase();

                const expiresAfterMinutes = 5;
                const expires = new Date(
                    new Date().getTime() + expiresAfterMinutes * 60000
                );

                const success = await c.var.repo.user.createLoginAttempt({
                    code,
                    expires,
                    ...c.req.valid("json")
                });

                if (success) {
                    return c.json({ code, expires }, 200);
                } else {
                    return c.json("Internal Server Error", 500);
                }
            }
        );
}
