import { Elysia } from "elysia";
import { env } from "process";
import logger from "./logger";

/** Third-party tools integrations. */
export default function integration() {
    return new Elysia({ name: "integration" })
        .use(logger())
        .macro({
            authenticateIntegration(integration: "telegram") {
                return {
                    beforeHandle: ({ logger, headers, error }) => {
                        let token = headers["authorization"];
                        if (token === undefined) return error(401);
                        token = token.replace(/^Bearer /, "");

                        if (integration === "telegram") {
                            const botToken = env.ITAM_EDU_API_BOT_TOKEN;
                            if (!botToken || token !== botToken) {
                                return error(401);
                            }
                        } else {
                            logger?.error(
                                `Unknown integration: \`${integration}\``
                            );
                            return error(401);
                        }
                    }
                };
            }
        })
        .as("plugin");
}
