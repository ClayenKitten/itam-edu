import { Elysia } from "elysia";
import { randomUUID } from "node:crypto";
import logger from "../../logger";

/**
 * Extends context with logger instance and logs HTTP requests.
 * */
export default function loggerPlugin(opts?: LoggerOptions) {
    return new Elysia({ name: "logger" })
        .onTransform(({ request }) => {
            logger.extend({ request: randomUUID() });
            if (opts?.enableHttpLogs === false) return;
            logger.debug("HTTP Request", {
                method: request.method,
                path: request.url
            });
        })
        .onAfterResponse(({ set }) => {
            if (opts?.enableHttpLogs === false) return;
            logger.debug("HTTP Response", {
                status: set.status
            });
        })
        .as("plugin");
}

/** Logger plugin options. */
export type LoggerOptions = {
    /**
     * Whether to log HTTP requests and responses.
     *
     * @default true
     * */
    enableHttpLogs?: boolean;
};
