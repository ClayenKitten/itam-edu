import { Elysia, t } from "elysia";
import { randomBytes } from "node:crypto";
import initContext from "../api/plugins";
import { NO_AUTHENTICATION, REQUIRE_TOKEN } from "../api/plugins/docs";
import { env } from "node:process";

export async function userController<PREFIX extends string>(prefix: PREFIX) {
    return new Elysia({ prefix, tags: ["Users"] })
        .use(initContext())
        .get(
            "/me",
            async ({ user, error }) => {
                if (!user) return error(401);
                return {
                    user: user.toPrivateDTO(),
                    enrollments: user.enrollments,
                    permissions: user.permissions.toDTO()
                };
            },
            {
                detail: {
                    summary: "Get current user information",
                    description: "Returns information about the current user.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .post(
            "/sessions",
            async ({ db, body, notification, error, set }) => {
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

                const user = await db.user.getByToken(token);
                notification.send(
                    `<b>Новый вход в платформу ITAM Education</b>\n\nЭто не вы? Напишите @${env.ITAM_EDU_API_TG_SUPPORT_USERNAME}!`,
                    user ? [user.id] : []
                );
                set.status = 201;
                return { token, expires };
            },
            {
                body: t.Object({
                    code: t.String({ minLength: 0, maxLength: 128 })
                }),
                detail: {
                    summary: "Authenticate user",
                    description:
                        "Authenticates user and creates a new session.\n\n" +
                        "Currently only supports OTP (one-time password) authentication.",
                    security: NO_AUTHENTICATION
                }
            }
        );
}
