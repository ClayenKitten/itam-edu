import { injectable } from "inversify";
import { Queue, Worker } from "bullmq";
import { queues, User } from "itam-edu-common";
import { AppConfig } from "./config";
import { Redis } from "./infra/redis";
import { UserRepository } from "./users/repository";
import { LoginCode, LoginCodeRepository } from "./users/login";
import logger from "./logger";

@injectable()
export class TelegramBot {
    public constructor(
        protected config: AppConfig,
        protected redis: Redis,
        protected userRepo: UserRepository,
        protected loginCodeRepo: LoginCodeRepository
    ) {
        this.queue = new Queue(queues.telegram.OUTBOUND_PRIVATE_MESSAGE_QUEUE, {
            connection: redis.createConnection()
        });
        this.worker = new Worker<queues.telegram.InboundPrivateMessage>(
            queues.telegram.INBOUND_PRIVATE_MESSAGE_QUEUE,
            async job => {
                return logger.with(
                    { sender: job.data.sender },
                    async () => await this.handleMessage(job.data)
                );
            },
            { connection: redis.createConnection(), autorun: false }
        );
    }

    protected queue: Queue<OutboundPrivateMessage>;
    protected worker: Worker<InboundPrivateMessage>;

    public async start(): Promise<void> {
        this.worker.run();
        await this.worker.waitUntilReady();
        logger.info("Started Telegram worker");
    }

    public async stop(): Promise<void> {
        this.worker.close();
        logger.info("Stopped Telegram worker");
    }

    public async send(
        user: User,
        text: string,
        link?: { text: string; url: string }
    ) {
        await this.queue.add("message", {
            chatId: user.telegram.id,
            text,
            link
        });
    }

    protected async handleMessage(msg: queues.telegram.InboundPrivateMessage) {
        const user = await this.userRepo.create({
            firstName: msg.sender.firstName,
            lastName: msg.sender.lastName,
            tgUserId: msg.sender.id,
            tgUsername: msg.sender.username
        });

        if (msg.text.trim() === "/login") {
            await this.handleLogin(user);
        } else {
            await this.handleHelp(user);
        }
    }

    protected async handleLogin(user: User): Promise<void> {
        const minutesBefore = (before: Date) =>
            Math.ceil((before.getTime() - new Date().getTime()) / 60000);
        const loginCode = LoginCode.create(user);
        await this.loginCodeRepo.set(loginCode);
        await this.send(
            user,
            [
                `<b>Привет, ${user.telegram.username}!</b>`,
                `✅ Код для входа: <code>${loginCode.code}</code>`,
                `Истекает через ${minutesBefore(loginCode.expires)} минут`,
                `<a href="${this.config.webUrl}?login&code=${loginCode.code}">🔗 Войти</a>`
            ].join("\n\n")
        );
    }

    protected async handleHelp(user: User): Promise<void> {
        await this.send(
            user,
            [
                "<b>ITAM Education 🎒</b>",
                "",
                `Бот-компаньон для <a href="${this.config.webUrl}">образовательной платформы ITAM Education</a>.`,
                "",
                "<b>💬 Команды</b>",
                "/login - получить код для входа на платформу",
                "",
                "<b>☎️ Поддержка</b>",
                `@${this.config.tg.supportUsername}`
            ].join("\n")
        );
    }
}

type OutboundPrivateMessage = queues.telegram.OutboundPrivateMessage;
type InboundPrivateMessage = queues.telegram.InboundPrivateMessage;
