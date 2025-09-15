import { Container } from "inversify";
import logger from "./logger";
import { ApiServer } from "./api";
import { TelegramBot } from "./infra/telegram";
import { BotService } from "./bot";
import type { AppConfig } from "itam-edu-common/config";

export class Application {
    public constructor(config: AppConfig, container: Container) {
        this.config = config;
        this.container = container;

        this.api = this.container.get(ApiServer);
        this.telegramBot = this.container.get(TelegramBot);
        this.botService = this.container.get(BotService);
    }

    public readonly config: AppConfig;
    public readonly container: Container;

    public readonly api: ApiServer;
    public readonly telegramBot: TelegramBot;
    public readonly botService: BotService;

    public async start(): Promise<void> {
        this.setupSignals();
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

    /** Ensures graceful shutdown based on OS signals. */
    private setupSignals() {
        const handleSignal = async (signal: NodeJS.Signals) => {
            logger.warning(`Received ${signal}`);
            try {
                await this.stop();
                process.exit(0);
            } catch {
                process.exit(1);
            }
        };
        process.once("SIGINT", handleSignal);
        process.once("SIGTERM", handleSignal);
    }
}
