import type { AppConfig } from "./config";
import { createAppContext } from "./ctx";

import ApiServer from "./api";
import TelegramWorker from "./telegram/worker";
import logger from "./logger";

export class Application {
    public constructor(config: AppConfig) {
        const ctx = createAppContext(config);

        this.api = new ApiServer(ctx);
        this.workers = {
            telegram: new TelegramWorker(ctx.config, ctx.db, ctx.services)
        };
    }

    private readonly api: ApiServer;
    private readonly workers: AppWorkers;

    public async start(): Promise<void> {
        await Promise.all([
            this.api.start(),
            ...[Object.values(this.workers).map(worker => worker.start())]
        ]);
        logger.info(`Application ready`);
    }

    public async stop(): Promise<void> {
        await Promise.all([
            this.api.stop(),
            ...[Object.values(this.workers).map(worker => worker.stop())]
        ]);
        logger.info(`Application stopped`);
    }
}

type AppWorkers = {
    telegram: TelegramWorker;
};
