import logger from "../logger";
import { Worker } from "bullmq";
import type { AppConfig } from "../config";
import { queues } from "itam-edu-common";
import type { TelegramSender } from "./sender";
import type UserRepository from "../users/repository";
import { handleLogin } from "./login";
import type { LoginCodeRepository } from "../users/login";

/** Worker for receiving Telegram messages. */
export default class TelegramWorker {
    public constructor(
        protected config: AppConfig,
        protected db: { user: UserRepository; loginCode: LoginCodeRepository },
        protected services: { telegramSender: TelegramSender }
    ) {
        this.worker = new Worker<queues.telegram.InboundPrivateMessage>(
            queues.telegram.INBOUND_PRIVATE_MESSAGE_QUEUE,
            async job => {
                return logger.with(
                    { sender: job.data.sender },
                    async () => await this.handleMessage(job.data)
                );
            },
            {
                connection: { url: config.redis.connectionString },
                autorun: false
            }
        );
    }

    protected worker: Worker;

    public async start(): Promise<void> {
        this.worker.run();
        await this.worker.waitUntilReady();
        logger.info("Started Telegram worker");
    }

    public async stop(): Promise<void> {
        await this.worker?.close();
        logger.info("Stopped Telegram worker");
    }

    public async handleMessage(msg: queues.telegram.InboundPrivateMessage) {
        const user = await this.db.user.create({
            firstName: msg.sender.firstName,
            lastName: msg.sender.lastName,
            tgUserId: msg.sender.id,
            tgUsername: msg.sender.username
        });

        let message: string;
        if (msg.text.trim() === "/login") {
            message = await handleLogin({ loginCode: this.db.loginCode }, user);
        } else {
            message = this.helpText;
        }

        this.services.telegramSender.send(user, message);
    }

    protected get helpText(): string {
        const HELP_MESSAGE: string = [
            "<b>ITAM Education 🎒</b>",
            "",
            `Бот-компаньон для <a href="${this.config.webUrl}">образовательной платформы ITAM Education</a>.`,
            "",
            "<b>💬 Команды</b>",
            "/login - получить код для входа на платформу",
            "",
            "<b>☎️ Поддержка</b>",
            `@${this.config.tg.supportUsername}`
        ].join("\n");
        return HELP_MESSAGE;
    }
}
