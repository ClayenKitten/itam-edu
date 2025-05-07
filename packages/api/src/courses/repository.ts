import { Repository } from "../db/repository";
import { type NotNull, sql } from "kysely";
import * as schema from "./schema";
import { schemaFields } from "../util";
import { Course } from "./entity";

export default class CourseRepository extends Repository {
    /** Returns course by its id. */
    public async getById(id: string): Promise<Course | null> {
        const result = await this.db
            .selectFrom("courses")
            .select(schemaFields(schema.course))
            .where("id", "=", id)
            .executeTakeFirst();
        if (!result) return null;
        return new Course(result);
    }

    /** Returns course by its slug. */
    public async getBySlug(
        slug: string,
        year?: number,
        semester?: number
    ): Promise<Course | null> {
        let query = this.db
            .selectFrom("courses")
            .select(schemaFields(schema.course))
            .where("slug", "=", slug)
            .orderBy("year desc")
            .orderBy("semester", sql<string>`asc nulls first`);
        if (year !== undefined) {
            query = query.where("year", "=", year);
        }
        if (semester !== undefined) {
            query = query.where("semester", "=", semester);
        }

        const result = await query.executeTakeFirst();
        if (!result) return null;
        return new Course(result) ?? null;
    }

    /** Returns all courses. */
    public async getAll(): Promise<Course[]> {
        const results = await this.db
            .selectFrom("courses")
            .select(schemaFields(schema.course))
            .orderBy("year desc")
            .orderBy("semester", sql<string>`asc nulls first`)
            .execute();
        return results.map(c => new Course(c));
    }

    /** Creates new course. */
    public async create(
        course: typeof schema.createCourse.static
    ): Promise<Course> {
        const result = await this.db
            .insertInto("courses")
            .values({
                slug: course.slug,
                year: course.year,
                semester: course.semester,
                title: course.title
            })
            .returning(schemaFields(schema.course))
            .executeTakeFirstOrThrow();
        return new Course(result);
    }

    /** Updates course information. */
    public async update(
        id: string,
        course: typeof schema.updateCourse.static
    ): Promise<Course | null> {
        const result = await this.db
            .updateTable("courses")
            .where("id", "=", id)
            .set(course)
            .returning(schemaFields(schema.course))
            .executeTakeFirst();
        if (!result) return null;
        return new Course(result);
    }
}
