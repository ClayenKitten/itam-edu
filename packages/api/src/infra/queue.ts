import { Job, Queue, Worker, type JobsOptions } from "bullmq";
import type { MaybePromise } from "../util";

/**
 * Configuration shared between publisher and worker.
 *
 * `queueName` ensures both ends talk to the same queue, and type parameter
 * ensures correct payload typing.
 */
export interface QueueConfig<_T> {
    queueName: string;
}

/**
 * Producer that sends events to the message queue.
 *
 * Many producers may exist per queue.
 * */
export class MessagePublisher<T> {
    private queue: Queue<T>;

    constructor(connectionString: string, cfg: QueueConfig<T>) {
        this.queue = new Queue<T>(cfg.queueName, {
            connection: { url: connectionString }
        });
    }

    async publish(
        payload: T,
        jobName: string = "msg",
        opts?: JobsOptions
    ): Promise<void> {
        await Job.create<T>(this.queue, jobName, payload, opts);
    }

    async close(): Promise<void> {
        await this.queue.close();
    }
}

/**
 * Worker that listens for incoming events on the message queue.
 *
 * Usually you should only create one worker per queue, as workers consume messages.
 * */
export class MessageWorker<T> {
    private worker: Worker<T>;

    constructor(
        connectionString: string,
        cfg: QueueConfig<T>,
        private onEvent: (jobName: string, payload: T) => MaybePromise<void>
    ) {
        this.worker = new Worker<T>(
            cfg.queueName,
            async job => {
                await this.onEvent(job.name, job.data);
            },
            { connection: { url: connectionString }, autorun: false }
        );
    }

    async start(): Promise<void> {
        this.worker.run();
        await this.worker.waitUntilReady();
    }

    async stop(): Promise<void> {
        await this.worker.close();
    }
}
