import { createMiddleware } from "hono/factory";
import type { Ctx } from "../ctx.js";
import { getCookie } from "hono/cookie";

export const authentication = () =>
    createMiddleware<{ Variables: Pick<Ctx, "repo" | "user"> }>(
        async (c, next) => {
            let token = c.req.header("Authorization");
            if (!token) {
                token = getCookie(c, "itam-edu-token");
            }
            if (token === undefined) {
                c.set("user", null);
                await next();
                return;
            }
            token = token.replace(/^Bearer /, "");

            const user = await c.var.repo.user.getByToken(token);
            c.set("user", user);
            await next();
        }
    );
