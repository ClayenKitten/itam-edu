import { Elysia, t } from "elysia";
import initContext from "../plugins";
import * as schema from "./schema";

export async function notificationController() {
    return new Elysia({ prefix: "/notifications", tags: ["Notifications"] })
        .use(initContext())
        .get("/unsent", async ({ db }) => {
            const notificationMessages =
                await db.notification.getUnsentMessages();
            return notificationMessages;
        })
        .post(
            "/send",
            async ({ db, body, error }) => {
                const { text, users } = body;

                if (!text || !users) {
                    return error(400, "Both 'text' and 'users' are required");
                }

                try {
                    await db.notification.sendNewNotification(text, users);
                    return { success: true };
                } catch (err) {
                    return error(500, "Failed to send notification");
                }
            },
            {
                body: t.Object({
                    text: t.String({ minLength: 1, maxLength: 4096 }),
                    users: t.Union([t.Array(t.String()), t.Literal("all")])
                })
            }
        )
        .put(
            "/send",
            async ({ db, body, error }) => {
                const { id, date } = body;

                if (!id || !date) {
                    return error(400, "Both 'id' and 'date' are required");
                }

                try {
                    await db.notification.changeMessageStatus(id, date);
                    return { success: true };
                } catch (err) {
                    return error(500, "Failed to send notification");
                }
            },
            {
                body: t.Object({
                    id: t.String({ format: "uuid" }),
                    date: t.Date()
                })
            }
        );
}
