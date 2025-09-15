import { Application } from "./app";
import {
    type AppConfig,
    ConfigError,
    createConfigFromEnv
} from "itam-edu-common/config";
import logger from "./logger";
import { exit } from "process";
import { createContainer } from "./di";

if (import.meta.main) {
    let config: AppConfig;
    try {
        config = createConfigFromEnv();
    } catch (e) {
        if (e instanceof ConfigError) {
            logger.fatal("Invalid configuration provided", {
                fields: e.fields
            });
        } else {
            logger.fatal("Unknown error during configuration gathering", {
                error: e
            });
        }
        exit(1);
    }

    const container = await createContainer(config);

    const application = new Application(config, container);
    await application.start();
}
