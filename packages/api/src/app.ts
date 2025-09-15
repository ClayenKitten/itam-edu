import { injectable } from "inversify";
import logger from "./logger";
import { ApiServer } from "./api";
import { TelegramBot } from "./infra/telegram";
import { BotService } from "./bot";

@injectable()
export class Application {
    public constructor(
        private api: ApiServer,
        private telegramBot: TelegramBot,
        private botService: BotService
    ) {}

    public async start(): Promise<void> {
        await Promise.all([
            this.api.start(),
            this.telegramBot.start(),
            this.botService.start()
        ]);
        logger.info(`Application ready`);
    }

    public async stop(): Promise<void> {
        await Promise.allSettled([
            this.api.stop(),
            this.telegramBot.stop(),
            this.botService.stop()
        ]);
        logger.info(`Application stopped`);
    }
}
