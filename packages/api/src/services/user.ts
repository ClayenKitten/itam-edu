import { Hono } from "hono";
import type { AppEnv } from "../ctx.js";

export async function userService() {
    return new Hono<AppEnv>()
        .get("/login", async c => {})
        .get("/me", async c => {
            const user = await c.var.db
                .selectFrom("users")
                .select([
                    "id",
                    "firstName",
                    "lastName",
                    "patronim",
                    "email",
                    "avatar",
                    "bio",
                    "tgUsername"
                ])
                .executeTakeFirst();
            if (!user) return c.text("Not Found", 404);
            return c.json(user);
        });
}
