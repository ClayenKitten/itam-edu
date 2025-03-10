import { Elysia, t } from "elysia";
import { randomBytes, randomInt } from "node:crypto";
import initContext from "../plugins";
import { DEFAULT_SECURITY } from "../plugins/docs";

export async function userController<PREFIX extends string>(prefix: PREFIX) {
    return new Elysia({ prefix, tags: ["Users"] })
        .use(initContext())
        .get(
            "/me",
            async ({ user, error }) => {
                if (!user) return error(401);
                return {
                    user: user.toPublicDTO(),
                    permissions: user.permissions.toDTO()
                };
            },
            {
                detail: {
                    summary: "Get current user information",
                    description: "Returns information about the current user.",
                    security: DEFAULT_SECURITY
                }
            }
        )
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
                }),
                detail: {
                    summary: "Authenticate user",
                    description:
                        "Authenticates user and creates a new session.\n\n" +
                        "Currently only supports OTP (one-time password) authentication."
                }
            }
        );
}
