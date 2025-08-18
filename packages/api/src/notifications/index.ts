import { randomUUID } from "node:crypto";
import type { MaybePromise } from "../util";

/**
 * An abstract factory for {@link WebNotification} and {@link TelegramNotification}.
 *
 * Should be implemented by concrete factories of specific notification types.
 * */
export abstract class NotificationTemplate {
    public abstract toWeb(
        /**
         * Unique id of the notification.
         *
         * Must be the same for both {@link WebNotification} and {@link TelegramNotification}.
         * */
        id: string,
        /** User to whom the notification is sent. */
        userId: string
    ): MaybePromise<WebNotification | null>;

    public abstract toTelegram(
        /**
         * Unique id of the notification.
         *
         * Must be the same for both {@link WebNotification} and {@link TelegramNotification}.
         * */
        id: string,
        /** User to whom the notification is sent. */
        userId: string
    ): MaybePromise<TelegramNotification | null>;
}

/** Notification  */
export type WebNotification = {
    /** Unique id of the notification. */
    readonly id: string;

    /** Very short notification name. */
    readonly title: string;

    /** PhosphorIcons icon name. */
    readonly icon: string;

    /** Identifier of the course. */
    readonly courseId: string | null;
};

export type TelegramNotification = {
    /** Unique id of the notification. */
    readonly id: string;

    /** HTML representation of the notification. */
    readonly html: string;

    /** Link attached to the message. */
    readonly link: TelegramNotificationLink | null;
};

export type TelegramNotificationLink = {
    text: string;
    url: string;
};
