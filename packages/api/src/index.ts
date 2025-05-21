import { Application } from "./app";
import { AppConfig } from "./config";
import logger from "./logger";
import { Container } from "inversify";

export const container = new Container({
    autobind: true,
    defaultScope: "Singleton"
});
container.bind(AppConfig).toConstantValue(AppConfig.createFromEnv());

const application = container.get(Application);
await application.start();

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
