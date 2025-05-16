import { injectable } from "inversify";
import { ApiServer } from "./api";
import { TelegramWorker } from "./telegram/worker";
import logger from "./logger";

@injectable()
export class Application {
    public constructor(
        private api: ApiServer,
        telegram: TelegramWorker
    ) {
        this.workers = { telegram };
    }
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
