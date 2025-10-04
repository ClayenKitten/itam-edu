import { injectable } from "inversify";
import type { Lesson } from "../entity";
import type { User } from "itam-edu-common";
import { Postgres } from "../../../../infra/postgres";
import type { AttendanceFormat } from "./query";

@injectable()
export class AttendanceDao {
    public constructor(private postgres: Postgres) {}

    /**
     * Adds user to attendees list.
     *
     * Does nothing if student is already recorded as an attendee.
     */
    public async add(
        lesson: Lesson,
        user: User,
        format: AttendanceFormat,
        manuallyAddedBy: string | null = null
    ): Promise<void> {
        await this.postgres.kysely
            .insertInto("lessonAttendees")
            .values({
                userId: user.id,
                lessonId: lesson.id,
                manuallyAddedBy,
                format
            })
            .onConflict(cb => cb.doNothing())
            .execute();
    }

    /**
     * Removes user from attendees list.
     *
     * Does nothing if student is not recorded as an attendee.
     */
    public async remove(
        actor: User,
        lesson: Lesson,
        user: User
    ): Promise<void> {
        await this.postgres.kysely
            .deleteFrom("lessonAttendees")
            .where("userId", "=", user.id)
            .where("lessonId", "=", lesson.id)
            .execute();
    }
}
