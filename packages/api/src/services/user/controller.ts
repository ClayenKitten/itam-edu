import { Hono } from "hono";
import type { AppEnv } from "../../ctx.js";

export async function userService() {
    return new Hono<AppEnv>()
        .get("/me", async c => {
            const user = c.var.user;
            if (!user) return c.text("Unauthorized", 401);
            return c.json(user);
        })
        .get("/me/permissions", async c => {
            const user = c.var.user;
            if (!user) return c.text("Unauthorized", 401);

            const permissions = await c.var.repo.user.getPermissions(user.id);
            if (!permissions) return c.text("Unauthorized", 401);

            return c.json(permissions);
        });
}
