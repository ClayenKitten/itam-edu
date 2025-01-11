import { createMiddleware } from "hono/factory";
import logger from "../logger.js";

export function loggerMiddleware() {
    return createMiddleware(async (c, next) => {
        logger.debug("HTTP Request", {
            http: "request",
            method: c.req.method,
            path: c.req.path
        });
        await next();
        logger.debug("HTTP Response", {
            http: "response",
            method: c.req.method,
            path: c.req.path,
            status: c.res.status
        });
    });
}
