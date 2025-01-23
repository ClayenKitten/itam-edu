import { Elysia, t } from "elysia";
import initContext from "../plugins";
import * as schema from "./schema";

export async function notificationController<PREFIX extends string>(
    prefix: PREFIX
) {
    return new Elysia({ prefix, tags: ["Notification"] })
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
        );
}
