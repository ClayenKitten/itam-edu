import { Elysia } from "elysia";
import { randomUUID } from "node:crypto";
import Logger from "./logger";

/**
 * Extends context with logger instance and logs HTTP requests.
 * */
export default function logger(opts?: LoggerOptions) {
    return new Elysia({ name: "logger" })
        .derive(() => ({
            logger: new Logger().child({ request: randomUUID() })
        }))
        .onStart(({ server }) =>
            new Logger().info(
                `Listening at http://${server?.hostname}:${server?.port}`
            )
        )
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
        .onStop(() => new Logger().info(`Server stopped`))
        .as("plugin");
}

export { Logger };

/** Logger plugin options. */
export type LoggerOptions = {
    /**
     * Whether to log HTTP requests and responses.
     *
     * @default true
     * */
    enableHttpLogs?: boolean;
};
