import { Repository } from "../db/repository";

export default class NotificationRepository extends Repository {
    public async create(text: string): Promise<string> {
        const { id } = await this.db
            .insertInto("notifications")
            .values({ text })
            .returning("id")
            .executeTakeFirstOrThrow();
        return id;
    }

    public async createMessage(
        notificationId: string,
        userId: string,
        tgMessageId: string
    ) {
        await this.db
            .insertInto("notificationMessages")
            .values({ userId, notificationId, tgMessageId })
            .execute();
    }
}
