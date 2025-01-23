import { t } from "elysia";

/** Information about the notification. */
export const notification = t.Object({
    id: t.String({ format: "uuid" }),
    notificationText: t.String({ minLength: 1, maxLength: 4096 }),
    createdAt: t.Nullable(t.Date()),
    senderId: t.Nullable(t.String({ format: "uuid" }))
});

export const createNotification = t.Pick(notification, [
    "notificationText",
    "senderId"
]);
export const updateNotification = t.Pick(notification, ["notificationText"]);

export const newNotification = t.Pick(notification, [
    "notificationText",
    "users"
]);

export const notificationMessage = t.Object({
    id: t.String({ format: "uuid" }),
    notificationId: t.String({ format: "uuid" }),
    userId: t.String({ format: "uuid" }),
    sentAt: t.Nullable(t.Date())
});

export const createNotificationMessage = t.Pick(notificationMessage, [
    "notificationId",
    "userId"
]);
export const updateNotificationMessage = t.Pick(notificationMessage, [
    "notificationId"
]);
