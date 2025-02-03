import { Repository } from "../../db/repository";
import { schemaFields } from "../../util";
import * as schema from "./schema";

export default class NotificationRepository extends Repository {
    public async sendNewNotification(text: string, users: string[] | "all") {
        const newNotification = await this.db
            .insertInto("notifications")
            .values({
                notificationText: text
            })
            .returning(schemaFields(schema.notification))
            .executeTakeFirstOrThrow();

        let userIds: string[];

        if (users === "all") {
            const usersFromDb = await this.db
                .selectFrom("users")
                .select("id")
                .execute();
            userIds = usersFromDb.map(user => user.id);
        } else {
            userIds = users;
        }

        for (const userId of userIds) {
            await this.db
                .insertInto("notificationMessages")
                .values({
                    notificationId: newNotification.id,
                    userId: userId,
                    sentAt: null
                })
                .executeTakeFirstOrThrow();
        }
    }

    public async getMessageText(id: string): Promise<string> {
        const notification = await this.db
            .selectFrom("notifications")
            .select("notificationText")
            .where("id", "=", id)
            .executeTakeFirst();

        if (!notification) {
            throw new Error(`Notification with id ${id} not found`);
        }

        return notification.notificationText;
    }

    public async changeMessageStatus(id: string, date: Date) {
        const message = await this.db
            .updateTable("notificationMessages")
            .set({ sentAt: date })
            .where("id", "=", id)
            .executeTakeFirstOrThrow();
        return message;
    }

    public async getUnsentMessages() {
        const notifications = await this.db
            .selectFrom("notificationMessages")
            .innerJoin(
                "notifications",
                "notifications.id",
                "notificationMessages.notificationId"
            )
            .selectAll("notificationMessages")
            .select("notifications.notificationText")
            .where("notificationMessages.sentAt", "is", null)
            .orderBy("notifications.createdAt", "asc")
            .execute();

        return notifications;
    }
}
