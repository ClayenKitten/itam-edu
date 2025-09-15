import { Job, Queue, Worker, type JobsOptions } from "bullmq";
import type { Branded, MaybePromise } from "../util";

/**
 * Queue name and payload type.
 *
 * @example
 * export const AppleQueueKind = "apple" as QueueKind<ApplePayload>;
 * */
export type QueueKind<PAYLOAD_TYPE> = Branded<
    string,
    ["QueueKind", PAYLOAD_TYPE]
>;

/**
 * Producer that sends events to the message queue.
 *
 * Many producers may exist per queue.
 * */
export class MessagePublisher<T> {
    private queue: Queue<T>;

    constructor(connectionString: string, queueKind: QueueKind<T>) {
        this.queue = new Queue<T>(queueKind, {
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
        queueKind: QueueKind<T>,
        private onEvent: (jobName: string, payload: T) => MaybePromise<void>
    ) {
        this.worker = new Worker<T>(
            queueKind,
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
