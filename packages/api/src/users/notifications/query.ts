import { injectable } from "inversify";
import { Redis } from "../../infra/redis";
import type { User } from "itam-edu-common";
import type { WebNotification } from "../../notifications";

@injectable()
export class NotificationsQuery {
    public constructor(private redis: Redis) {}

    /** Returns all notifications of the user. */
    public async getAll(actor: User): Promise<WebNotification[]> {
        const stream = await this.redis.xRange(
            `notifications:${actor.id}`,
            "-",
            "+"
        );
        const notifications: WebNotification[] = stream.map(({ message }) =>
            JSON.parse(message.payload!)
        );
        return notifications;
    }
}
