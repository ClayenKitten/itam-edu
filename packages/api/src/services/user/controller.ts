import { Elysia, t } from "elysia";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import initContext from "../../plugins";

export async function userController<PREFIX extends string>(prefix: PREFIX) {
    return new Elysia({ prefix, tags: ["Users"] })
        .use(initContext())
        .get("/me", async ({ db, user, error }) => {
            if (!user) return error(401);

            const permissions = await db.user.getPermissions(user.id);
            if (!permissions) return error(401);

            return { user, permissions };
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
        );
}
