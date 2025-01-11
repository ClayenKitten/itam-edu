import { Hono } from "hono";
import type { AppEnv } from "../../ctx.js";

export async function userService() {
    return new Hono<AppEnv>().get("/me", async c => {
        const user = c.var.user;
        if (!user) return c.text("Not Found", 404);
        return c.json(user);
    });
}
