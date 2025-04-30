import type { AppConfig } from "./config";
import { createAppContext } from "./ctx";

import ApiServer from "./api";
import TelegramBot from "./telegram";
import NotificationWorker from "./notifications/worker";
import logger from "./logger";

export class Application {
    public constructor(config: AppConfig) {
        const ctx = createAppContext(config);

        this.api = new ApiServer(ctx);
        this.telegram = new TelegramBot(ctx);
        this.workers = {
            notification: new NotificationWorker(
                ctx.config.redis,
                ctx.db,
                this.telegram
            )
        };
    }

    private readonly api: ApiServer;
    private readonly telegram: TelegramBot;
    private readonly workers: AppWorkers;

    public async start(): Promise<void> {
        await Promise.all([
            this.api.start(),
            this.telegram.start(),
            ...[Object.values(this.workers).map(worker => worker.start())]
        ]);
        logger.info(`Application ready`);
    }

    public async stop(): Promise<void> {
        await Promise.all([
            this.api.stop(),
            this.telegram.stop(),
            ...[Object.values(this.workers).map(worker => worker.stop())]
        ]);
        logger.info(`Application stopped`);
    }
}

type AppWorkers = {
    notification: NotificationWorker;
};
