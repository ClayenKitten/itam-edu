import type { MaybePromise } from "../util";
import type { OutboundBotMessage } from "../bot";

/**
 * An abstract factory for {@link WebNotification} and {@link TelegramNotification}.
 *
 * Should be implemented by concrete factories of specific notification types.
 * */
export abstract class NotificationTemplate {
    public abstract toWeb(
        /** Unique id of the notification. */
        id: string,
        /** User to whom the notification is sent. */
        userId: string
    ): MaybePromise<WebNotification | null>;

    public abstract toTelegram(
        /** Unique id of the notification. */
        id: string,
        /** User to whom the notification is sent. */
        userId: string
    ): MaybePromise<OutboundBotMessage | null>;
}

/** Notification displayed to the user at the web platform. */
export type WebNotification = {
    /** Unique id of the notification. */
    readonly id: string;

    /** Unix timestamp of the notification. */
    readonly timestamp: number;

    /** Very short notification name. */
    readonly title: string;

    /** PhosphorIcons icon name. */
    readonly icon: string;

    /** URL to follow on click. */
    readonly url: string | null;

    /** Identifier of the course. */
    readonly courseId: string | null;
};
