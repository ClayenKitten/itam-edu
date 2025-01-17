import { Elysia, t } from "elysia";
import { env } from "process";
import { randomInt } from "node:crypto";

import initContext from "../plugins";
import authenticateBot from "../plugins/authenticateBot";

export async function botController<PREFIX extends string>(prefix: PREFIX) {
    return new Elysia({ prefix, tags: ["Bot"] })
        .use(initContext())
        .use(authenticateBot(env.ITAM_EDU_API_BOT_TOKEN!))
        .post(
            "/login",
            async ({ db, body, error }) => {
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

                const success = await db.user.createLoginAttempt({
                    code,
                    expires,
                    ...body
                });

                if (success) {
                    return { code, expires };
                } else {
                    return error(500);
                }
            },
            {
                body: t.Object({
                    tgUserId: t.String(),
                    tgChatId: t.String(),
                    tgUsername: t.String()
                })
            }
        );
}
