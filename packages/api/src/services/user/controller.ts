import { Hono } from "hono";
import type { AppEnv } from "../../ctx.js";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomBytes } from "node:crypto";

export async function userService() {
    return new Hono<AppEnv>()
        .get("/me", async c => {
            const user = c.var.user;
            if (!user) return c.text("Unauthorized", 401);

            const permissions = await c.var.repo.user.getPermissions(user.id);
            if (!permissions) return c.text("Unauthorized", 401);

            return c.json({ user, permissions });
        })
        .post(
            "/me/session",
            zValidator("json", z.object({ code: z.string().max(128) })),
            async c => {
                const { code } = c.req.valid("json");

                const token = `itam-edu-${randomBytes(128).toString("base64url")}`;
                const expires = new Date(
                    new Date().getTime() + 30 * 24 * 60 * 60 * 1000
                );

                const success = await c.var.repo.user.completeLoginAttempt({
                    code,
                    token,
                    expires
                });
                if (!success) return c.text("Unauthorized", 401);
                return c.json({ token, expires }, 200);
            }
        );
}
