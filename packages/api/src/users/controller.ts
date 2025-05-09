import { Elysia, t } from "elysia";
import { NO_AUTHENTICATION, REQUIRE_TOKEN } from "../api/plugins/docs";
import type { AppContext } from "../ctx";
import { authenticationPlugin } from "../api/plugins/authenticate";
import { Session } from "./session";

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
            async ({ config, db, body, services, status }) => {
                const loginCode = await db.loginCode.get(body.code);
                if (!loginCode) return status(404, "Login code does not match");
                await db.loginCode.delete(loginCode);

                const user = (await db.user.getById(loginCode.userId))!;
                const session = Session.create(user);
                await db.session.add(session);

                services.notification.send(
                    `<b>🔐 Новый вход в платформу ITAM Education</b>\n\nЭто не вы? Напишите @${config.tg.supportUsername}!`,
                    user ? [user.id] : []
                );
                return status(201, {
                    token: session.token,
                    expires: session.expires
                });
            },
            {
                body: t.Object({
                    code: t.String({ minLength: 0, maxLength: 128 })
                }),
                detail: {
                    summary: "Authenticate user",
                    description:
                        "Authenticates user and creates a new session.",
                    security: NO_AUTHENTICATION
                }
            }
        );
}
