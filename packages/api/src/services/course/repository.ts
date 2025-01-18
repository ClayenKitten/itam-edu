import { Repository } from "../../plugins/db/repository";
import { type NotNull, sql } from "kysely";
import * as schema from "./schema";
import { schemaFields } from "../../util";

export default class CourseRepository extends Repository {
    public async get(id: string): Promise<typeof schema.course.static | null> {
        const course = await this.db
            .selectFrom("courses")
            .select(schemaFields(schema.course))
            .where("id", "=", id)
            .executeTakeFirst();
        return course ?? null;
    }

    public async getAll() {
        return await this.db
            .selectFrom("courses")
            .select(schemaFields(schema.course))
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

    public async update(
        id: string,
        course: typeof schema.updateCourse.static
    ): Promise<typeof schema.course.static | null> {
        const newCourse = await this.db
            .updateTable("courses")
            .where("id", "=", id)
            .set(course)
            .returning(schemaFields(schema.course))
            .executeTakeFirst();
        return newCourse ?? null;
    }

    public async lookup(
        slug: string,
        year?: number,
        semester?: number
    ): Promise<{ id: string } | null> {
        let query = this.db
            .selectFrom("courses")
            .select("id")
            .where("slug", "=", slug)
            .orderBy("year desc")
            .orderBy("semester", sql<string>`asc nulls first`);
        if (year !== undefined) {
            query = query.where("year", "=", year);
        }
        if (semester !== undefined) {
            query = query.where("semester", "=", semester);
        }

        return (await query.executeTakeFirst()) ?? null;
    }
}
