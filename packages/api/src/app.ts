import { injectable } from "inversify";
import logger from "./logger";
import { ApiServer } from "./api";
import { TelegramBot } from "./telegram";

@injectable()
export class Application {
    public constructor(
        protected api: ApiServer,
        protected telegramBot: TelegramBot
    ) {}

    public async start(): Promise<void> {
        await Promise.all([this.api.start(), this.telegramBot.start()]);
        logger.info(`Application started`);
    }

    public async stop(): Promise<void> {
        await Promise.all([this.api.stop(), this.telegramBot.stop()]);
        logger.info(`Application stopped`);
    }
}
