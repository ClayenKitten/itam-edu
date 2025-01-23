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

    public async getUnsentMessages(): Promise<
        (typeof schema.notificationMessage.static)[] | null
    > {
        const notifications = await this.db
            .selectFrom("notificationMessages")
            .select(schemaFields(schema.notificationMessage))
            .where("sentAt", "is", null)
            .execute();
        return notifications ?? null;
    }
}
