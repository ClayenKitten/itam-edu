import { Elysia, t } from "elysia";
import { randomBytes, randomInt } from "node:crypto";
import initContext from "../plugins";

export async function userController<PREFIX extends string>(prefix: PREFIX) {
    return new Elysia({ prefix, tags: ["Users"] })
        .use(initContext())
        .get("/me", async ({ user, error }) => {
            if (!user) return error(401);
            return {
                user: user.toPublicDTO(),
                permissions: user.permissions.toDTO()
            };
        })
        .post(
            "/me/session",
            async ({ db, body, error }) => {
                const token = `itam-edu-${randomBytes(128).toString("base64url")}`;
                const expires = new Date(
                    new Date().getTime() + 30 * 24 * 60 * 60 * 1000
                );

                const success = await db.user.completeLoginAttempt({
                    code: body.code,
                    token,
                    expires
                });
                if (!success) return error(401);
                return { token, expires };
            },
            {
                body: t.Object({
                    code: t.String({ minLength: 0, maxLength: 128 })
                })
            }
        )
        .post(
            "/loginAttempt",
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
                detail: {
                    description:
                        "Creates login attempt for user if it exists, and creates user otherwise.",
                    tags: ["Users", "Telegram Bot"]
                },
                authenticateIntegration: "telegram",
                body: t.Object({
                    tgUserId: t.String(),
                    tgChatId: t.String(),
                    tgUsername: t.String()
                })
            }
        );
}
