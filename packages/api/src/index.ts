import { Application } from "./app";
import {
    type AppConfig,
    ConfigError,
    createConfigFromEnv
} from "itam-edu-common/config";
import logger from "./logger";
import { Container } from "inversify";
import { exit } from "process";
import { Redis } from "./infra/redis";

// DI container
export const container = new Container({
    autobind: true,
    defaultScope: "Singleton"
});

// Config
let config: AppConfig;
try {
    config = createConfigFromEnv();
} catch (e) {
    if (e instanceof ConfigError) {
        logger.fatal("Invalid configuration provided", { fields: e.fields });
    } else {
        logger.fatal("Unknown error during configuration gathering", {
            error: e
        });
    }
    exit(1);
}

// Bindings
container.bind<AppConfig>("AppConfig").toConstantValue(createConfigFromEnv());
container
    .bind(Redis)
    .toConstantValue(await Redis.connect(config.redis.connectionString));

// Application
const application = container.get(Application);
await application.start();

// Signals
async function handleSignal(signal: NodeJS.Signals) {
    logger.warning(`Received ${signal}`);
    try {
        await application.stop();
        process.exit(0);
    } catch {
        process.exit(1);
    }
}
process.once("SIGINT", handleSignal);
process.once("SIGTERM", handleSignal);
