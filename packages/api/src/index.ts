import { Application } from "./app";
import { createConfigFromEnv } from "./config";
import logger from "./logger";

const config = createConfigFromEnv();

const application = new Application(config);
await application.start();

async function handleSignal(signal: NodeJS.Signals) {
    logger.info(`Received ${signal}`);
    try {
        await application.stop();
        process.exit(0);
    } catch {
        process.exit(1);
    }
}
process.once("SIGINT", handleSignal);
process.once("SIGTERM", handleSignal);
