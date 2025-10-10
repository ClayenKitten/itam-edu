import { injectable } from "inversify";
import { Postgres } from "../../infra/postgres";
import type { User } from "itam-edu-common";
import { sql, type NotNull } from "kysely";

@injectable()
export class EventQuery {
    public constructor(protected postgres: Postgres) {}

    public async get(user: User, filters?: EventFilters): Promise<Event[]> {
        let courseIds = await this.postgres.kysely
            .selectFrom("userCourses")
            .where("userId", "=", user.id)
            .select("courseId")
            .execute()
            .then(courses => courses.map(c => c.courseId));
        if (filters?.course?.length) {
            courseIds = courseIds.filter(id => filters.course!.includes(id));
        }
        if (courseIds.length === 0) {
            return [];
        }
        const kinds = filters?.kind || ["lesson", "homework"];
        const events = (
            await Promise.all([
                kinds.includes("lesson")
                    ? this.getLessons(courseIds, filters)
                    : Promise.resolve([]),
                kinds.includes("homework")
                    ? this.getHomeworks(courseIds, filters)
                    : Promise.resolve([])
            ])
        ).flat();
        events.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
        return events;
    }

    private async getLessons(
        courseIds: string[],
        filters?: EventFilters
    ): Promise<Event[]> {
        let query = this.postgres.kysely
            .selectFrom("lessons")
            .innerJoin("courses", "lessons.courseId", "courses.id")
            .select([
                sql.lit("lesson" as const).as("kind"),
                "lessons.id",
                "lessons.title",
                sql.ref("lessons.scheduledAt").as("datetime"),
                sql.ref("courses.id").as("courseId")
            ])
            .where("lessons.courseId", "in", courseIds)
            .where("lessons.scheduledAt", "is not", null)
            .$narrowType<{ datetime: NotNull }>();

        if (filters?.after) {
            query = query.where("lessons.scheduledAt", ">", filters.after);
        }
        if (filters?.before) {
            query = query.where("lessons.scheduledAt", "<", filters.before);
        }
        const result = (await query.execute()) as Event[];
        return result;
    }

    private async getHomeworks(
        courseIds: string[],
        filters?: EventFilters
    ): Promise<Event[]> {
        let query = this.postgres.kysely
            .selectFrom("homeworks")
            .innerJoin("courses", "homeworks.courseId", "courses.id")
            .select([
                sql.lit("homework" as const).as("kind"),
                "homeworks.id",
                "homeworks.title",
                sql.ref("homeworks.deadline").as("datetime"),
                sql.ref("courses.id").as("courseId")
            ])
            .where("homeworks.courseId", "in", courseIds)
            .where("homeworks.deadline", "is not", null)
            .$narrowType<{ datetime: NotNull }>();

        if (filters?.after) {
            query = query.where("homeworks.deadline", ">", filters.after);
        }
        if (filters?.before) {
            query = query.where("homeworks.deadline", "<", filters.before);
        }
        const result = (await query.execute()) as Event[];
        return result;
    }
}

export type EventFilters = {
    after?: Date;
    before?: Date;
    kind?: Array<"lesson" | "homework">;
    course?: string[];
};

export type Event = {
    id: string;
    title: string;
    datetime: Date;
    courseId: string;
} & ({ kind: "lesson" } | { kind: "homework" });
