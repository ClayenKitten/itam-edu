import { queues } from "itam-edu-common";
import { env, SQL } from "bun";
import { Queue, Worker } from "bullmq";

const db = new SQL({
    url: env.ITAM_EDU_API_POSTGRES_CONNECTION_STRING,
    tls: false
});
const queue = new Queue<queues.telegram.InboundPrivateMessage>(
    queues.telegram.INBOUND_PRIVATE_MESSAGE_QUEUE,
    { connection: { url: env.ITAM_EDU_API_REDIS_CONNECTION_STRING } }
);
const worker = new Worker<queues.telegram.OutboundPrivateMessage>(
    queues.telegram.OUTBOUND_PRIVATE_MESSAGE_QUEUE,
    async job => {
        const userMessages = messages.get(job.data.chatId) ?? [];
        userMessages.push({
            author: "bot",
            text: job.data.text,
            sentAt: new Date()
        });
        messages.set(job.data.chatId, userMessages);
    },
    { connection: { url: env.ITAM_EDU_API_REDIS_CONNECTION_STRING } }
);

export async function getUsers(): Promise<User[]> {
    const sql = await db.connect();
    const users =
        await sql`SELECT id, first_name as "firstName", last_name as "lastName", tg_username as "tgUsername", tg_user_id as "tgUserId" FROM users ORDER BY first_name`;
    return users;
}

export async function addUser(user: User): Promise<void> {
    const sql = await db.connect();
    await sql`INSERT INTO users(id, first_name, last_name, tg_username, tg_user_id, tg_chat_id) VALUES (${user.id}, ${user.firstName}, ${user.lastName}, ${user.tgUsername}, ${user.tgUserId}, ${user.tgUserId});`;
}

const messages = new Map<string, Message[]>();
export async function getMessages(tgUserId: string): Promise<Message[]> {
    return messages.get(tgUserId) ?? [];
}
export async function sendMessage(
    sender: Sender,
    text: string
): Promise<Message[]> {
    await queue.add("fakeMessage", { sender, text });
    const userMessages = messages.get(sender.id) ?? [];
    userMessages.push({
        author: "user",
        text,
        sentAt: new Date()
    });
    messages.set(sender.id, userMessages);
    return userMessages;
}

export type Sender = queues.telegram.InboundPrivateMessage["sender"];
export type User = {
    id: string;
    firstName: string;
    lastName: string | null;
    tgUsername: string;
    tgUserId: string;
};
export type Message = { author: "bot" | "user"; text: string; sentAt: Date };
