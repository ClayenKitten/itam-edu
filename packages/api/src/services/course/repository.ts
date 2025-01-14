import type { DB } from "itam-edu-db";
import { type Kysely, type NotNull, sql } from "kysely";
import type { TypeOf } from "zod";
import type { updateCourseSchema } from "./schema.js";

export default class CourseRepository {
    constructor(private db: Kysely<DB>) {}

    public async get(id: string) {
        return await this.db
            .selectFrom("courses")
            .selectAll()
            .where("id", "=", id)
            .executeTakeFirst();
    }

    public async getAll() {
        return await this.db
            .selectFrom("courses")
            .select([
                "id",
                "year",
                "semester",
                "slug",
                "title",
                "description",
                "logo",
                "public",
                "archived"
            ])
            .select(eb => [
                eb
                    .selectFrom("courseStudents")
                    .select(sql<number>`count(*)::int`.as("studentsCount"))
                    .whereRef("courses.id", "=", "courseStudents.courseId")
                    .as("studentsCount")
            ])
            .orderBy("year desc")
            .orderBy("semester", sql<string>`asc nulls first`)
            .$narrowType<{ studentsCount: NotNull }>()
            .execute();
    }

    public async lookup(params: {
        year: number;
        semester: number | null;
        courseSlug: string;
    }) {
        let query = this.db
            .selectFrom("courses")
            .select("id")
            .where("year", "=", params.year)
            .where("slug", "=", params.courseSlug);

        if (params.semester !== null) {
            query = query.where("semester", "=", params.semester);
        } else {
            query = query.where("semester", "is", null);
        }

        return await query.executeTakeFirst();
    }

    public async update(id: string, course: TypeOf<typeof updateCourseSchema>) {
        return (
            (
                await this.db
                    .updateTable("courses")
                    .where("id", "=", id)
                    .set(course)
                    .executeTakeFirst()
            ).numUpdatedRows !== 0n
        );
    }
}
