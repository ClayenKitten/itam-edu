import { Elysia, t } from "elysia";
import { randomBytes } from "node:crypto";
import { NO_AUTHENTICATION, REQUIRE_TOKEN } from "../api/plugins/docs";
import { env } from "node:process";
import type { AppContext } from "../ctx";
import { authenticationPlugin } from "../api/plugins/authenticate";

export async function userController(ctx: AppContext) {
    return new Elysia({ prefix: "/users", tags: ["Users"] })
        .derive(() => ctx)
        .use(authenticationPlugin(ctx))
        .get(
            "/me",
            async ({ user }) => {
                return {
                    user: {
                        id: user.id,
                        info: user.info,
                        telegram: user.telegram,
                        enrollments: user.enrollments,
                        permissions: user.permissions
                    }
                };
            },
            {
                requireAuthentication: true,
                detail: {
                    summary: "Get current user information",
                    description: "Returns information about the current user.",
                    security: REQUIRE_TOKEN
                }
            }
        )
        .post(
            "/sessions",
            async ({ db, body, services, error, set }) => {
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
                services.notification.send(
                    `<b>🔐 Новый вход в платформу ITAM Education</b>\n\nЭто не вы? Напишите @${env.ITAM_EDU_API_TG_SUPPORT_USERNAME}!`,
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
