import { createMiddleware } from "hono/factory";

export const botAuthentication = (botToken: string) =>
    createMiddleware(async (c, next) => {
        let token = c.req.header("Authorization");
        if (token === undefined) return c.text("Forbidden", 403);

        token = token.replace(/^Bearer /, "");
        if (token !== botToken) return c.text("Forbidden", 403);

        await next();
    });
