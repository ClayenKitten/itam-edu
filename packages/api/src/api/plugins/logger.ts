import { Elysia } from "elysia";
import { randomUUID } from "node:crypto";
import logger from "../../logger";

/** Logs HTTP requests. **/
export default function httpLogger() {
    return new Elysia({ name: "logger" })
        .onTransform(({ request }) => {
            logger.extend({ request: randomUUID() });
            logger.debug("HTTP Request", {
                method: request.method,
                path: request.url
            });
        })
        .onAfterResponse(({ set }) => {
            logger.debug("HTTP Response", {
                status: set.status
            });
        })
        .as("plugin");
}
