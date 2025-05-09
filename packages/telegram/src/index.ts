import { Queue, Worker } from "bullmq";
import { queues } from "itam-edu-common";
import { env } from "process";
import TelegramBot from "./bot";

const queue = new Queue<queues.telegram.InboundPrivateMessage>(
    queues.telegram.INBOUND_PRIVATE_MESSAGE_QUEUE,
    {
        connection: {
            url: env.ITAM_EDU_API_REDIS_CONNECTION_STRING!
        }
    }
);
const bot = new TelegramBot(env.ITAM_EDU_API_TG_TOKEN!, payload => {
    queue.add("message", payload);
});
const worker = new Worker<queues.telegram.OutboundPrivateMessage>(
    queues.telegram.OUTBOUND_PRIVATE_MESSAGE_QUEUE,
    async job => {
        await bot.sendMessage(job.data.chatId, job.data.text);
    },
    {
        connection: {
            url: env.ITAM_EDU_API_REDIS_CONNECTION_STRING!
        }
    }
);

bot.start();
