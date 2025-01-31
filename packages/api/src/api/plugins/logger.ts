import { Elysia } from "elysia";
import { randomUUID } from "node:crypto";
import Logger from "../../logger";

/**
 * Extends context with logger instance and logs HTTP requests.
 * */
export default function logger(opts?: LoggerOptions) {
    const base = opts?.base ?? new Logger();
    return new Elysia({ name: "logger" })
        .derive(() => ({
            logger: base.child({ request: randomUUID() })
        }))
        .onTransform(({ logger, request }) => {
            if (opts?.enableHttpLogs === false) return;
            logger.debug("HTTP Request", {
                method: request.method,
                path: request.url
            });
        })
        .onAfterResponse(({ logger, set }) => {
            if (opts?.enableHttpLogs === false) return;
            logger.debug("HTTP Response", {
                status: set.status
            });
        })
        .as("plugin");
}

/** Logger plugin options. */
export type LoggerOptions = {
    base?: Logger;
    /**
     * Whether to log HTTP requests and responses.
     *
     * @default true
     * */
    enableHttpLogs?: boolean;
};
