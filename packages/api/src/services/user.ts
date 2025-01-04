import { Hono } from "hono";
import type { AppEnv } from "../index.js";

export async function userService() {
    return new Hono<AppEnv>()
        .get("/login", async c => {})
        .get("/me", async c => {
            const courses = await c.var.db
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
                .execute();
            return c.json(courses);
        });
}
