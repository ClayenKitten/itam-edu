import type { CalendarEvent, User } from "itam-edu-common";
import type { DB } from "itam-edu-db";
import { sql, type NotNull } from "kysely";
import type { Kysely } from "kysely";

export class CalendarQuery {
    public constructor(private db: Kysely<DB>) {}

    public async get(
        user: User,
        filters?: CalendarFilters
    ): Promise<CalendarEvent[]> {
        const courseIds = await this.db
            .selectFrom("userCourses")
            .where("userId", "=", user.id)
            .select("courseId")
            .execute()
            .then(courses => courses.map(c => c.courseId));
        if (courseIds.length === 0) {
            return [];
        }

        const events = (
            await Promise.all([
                this.getLessons(courseIds, filters),
                this.getHomeworks(courseIds, filters)
            ])
        ).flat(1);

        events.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
        return events;
    }

    private async getLessons(
        courseIds: string[],
        filters?: CalendarFilters
    ): Promise<CalendarEvent[]> {
        let query = this.db
            .selectFrom("lessons")
            .innerJoin("courses", "courseId", "courses.id")
            .select([
                sql.lit("lesson" as const).as("kind"),
                "lessons.id",
                "lessons.title",
                "lessons.scheduledAt as datetime",
                "courses.id as courseId"
            ])
            .where("courseId", "in", courseIds)
            .where("scheduledAt", "is not", null)
            .$narrowType<{ datetime: NotNull }>();
        if (filters?.after) {
            query = query.where("scheduledAt", ">", filters.after);
        }
        if (filters?.before) {
            query = query.where("scheduledAt", "<", filters.before);
        }
        return await query.execute();
    }

    private async getHomeworks(
        courseIds: string[],
        filters?: CalendarFilters
    ): Promise<CalendarEvent[]> {
        let query = this.db
            .selectFrom("homeworks")
            .innerJoin("courses", "courseId", "courses.id")
            .select([
                sql.lit("homework" as const).as("kind"),
                "homeworks.id",
                "homeworks.title",
                "homeworks.deadline as datetime",
                "courses.id as courseId"
            ])
            .where("courseId", "in", courseIds)
            .where("deadline", "is not", null)
            .$narrowType<{ datetime: NotNull }>();
        if (filters?.after) {
            query = query.where("deadline", ">", filters.after);
        }
        if (filters?.before) {
            query = query.where("deadline", "<", filters.before);
        }
        return await query.execute();
    }
}

export type CalendarFilters = { after?: Date; before?: Date };
