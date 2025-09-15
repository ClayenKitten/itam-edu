import { env, SQL } from "bun";
import { Queue, Worker } from "bullmq";

const db = new SQL({
    url: env.ITAMEDU_POSTGRES_CONNECTION_STRING,
    tls: false
});

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

export const messages = new Map<string, Message[]>();
export async function getMessages(tgUserId: string): Promise<Message[]> {
    return messages.get(tgUserId) ?? [];
}

export type User = {
    id: string;
    firstName: string;
    lastName: string | null;
    tgUsername: string;
    tgUserId: string;
};
export type Message = { author: "bot" | "user"; text: string; sentAt: Date };
