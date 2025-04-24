import { Elysia } from "elysia";
import { randomUUID } from "node:crypto";
import logger from "../../logger";

/** Logs HTTP requests. **/
export function httpLoggerPlugin() {
    return new Elysia({ name: "logger" })
        .onTransform(({ request }) => {
            const url = new URL(request.url);
            logger.extend({ request: randomUUID() });
            logger.debug("HTTP Request", {
                method: request.method,
                path: url.pathname,
                origin: url.origin
            });
        })
        .onAfterResponse(({ set }) => {
            logger.debug("HTTP Response", {
                status: set.status
            });
        })
        .as("plugin");
}
