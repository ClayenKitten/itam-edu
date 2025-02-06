import { Repository } from "../db/repository";

export default class NotificationRepository extends Repository {
    /** Schedules notification for sending. */
    public async schedule(
        text: string,
        users: string[] | "all"
    ): Promise<void> {
        await this.db.transaction().execute(async trx => {
            const { id } = await trx
                .insertInto("notifications")
                .values({
                    text
                })
                .returning("id")
                .executeTakeFirstOrThrow();
            if (users === "all") {
                await trx
                    .insertInto("notificationMessages")
                    .columns(["notificationId", "userId", "sentAt"])
                    .expression(eb =>
                        eb
                            .selectFrom("users")
                            .select(eb => [
                                eb.val(id).as("notificationId"),
                                eb.ref("users.id").as("userId"),
                                eb.lit(null).as("sentAt")
                            ])
                    )
                    .execute();
            } else {
                await trx
                    .insertInto("notificationMessages")
                    .values(
                        users.map(userId => ({
                            notificationId: id,
                            userId,
                            sentAt: null
                        }))
                    )
                    .execute();
            }
        });
    }

    /** Returns unsent notifications. */
    public async getUnsent(limit: number = 30): Promise<UnsentNotification[]> {
        const notifications = await this.db
            .selectFrom("notificationMessages")
            .innerJoin(
                "notifications",
                "notifications.id",
                "notificationMessages.notificationId"
            )
            .innerJoin("users", "users.id", "notificationMessages.userId")
            .select(["notifications.id", "userId", "text", "users.tgChatId"])
            .where("notificationMessages.sentAt", "is", null)
            .orderBy("notifications.createdAt", "asc")
            .limit(limit)
            .execute();
        return notifications;
    }

    /** Marks notification as sent. */
    public async markAsSent(id: string, userId: string): Promise<void> {
        await this.db
            .updateTable("notificationMessages")
            .set({ sentAt: new Date() })
            .where("notificationId", "=", id)
            .where("userId", "=", userId)
            .execute();
    }
}

export type UnsentNotification = {
    id: string;
    userId: string;
    tgChatId: string;
    text: string;
};
