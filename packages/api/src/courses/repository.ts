import { injectable } from "inversify";
import { sql, type Selectable } from "kysely";
import * as schema from "./schema";
import { schemaFields } from "../util";
import { Course } from "./entity";
import { Postgres } from "../infra/postgres";
import type { DB } from "itam-edu-db";

@injectable()
export class CourseRepository {
    public constructor(protected postgres: Postgres) {}

    /** Returns course by its id. */
    public async getById(id: string): Promise<Course | null> {
        const courseInfo = await this.postgres.kysely
            .selectFrom("courses")
            .select(schemaFields(schema.course))
            .where("id", "=", id)
            .executeTakeFirst();
        if (!courseInfo) return null;

        const members = await this.postgres.kysely
            .selectFrom("userCourses")
            .where("courseId", "=", courseInfo.id)
            .select(["userId", "isStaff"])
            .execute();

        return this.toEntity(courseInfo, members);
    }

    /** Returns course by its slug. */
    public async getBySlug(
        slug: string,
        year?: number,
        semester?: number
    ): Promise<Course | null> {
        let query = this.postgres.kysely
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
        const courseInfo = await query.executeTakeFirst();
        if (!courseInfo) return null;

        const members = await this.postgres.kysely
            .selectFrom("userCourses")
            .where("courseId", "=", courseInfo.id)
            .select(["userId", "isStaff"])
            .execute();

        return this.toEntity(courseInfo, members);
    }

    /** Creates new course. */
    public async create(
        course: typeof schema.createCourse.static
    ): Promise<Course> {
        const result = await this.postgres.kysely
            .insertInto("courses")
            .values({
                slug: course.slug,
                year: course.year,
                semester: course.semester,
                title: course.title
            })
            .returning(schemaFields(schema.course))
            .executeTakeFirstOrThrow();
        return this.toEntity(result, []);
    }

    /**
     * Updates course information.
     *
     * @returns true if course was updated, false otherwise.
     * */
    public async update(
        id: string,
        course: typeof schema.updateCourse.static
    ): Promise<boolean> {
        const result = await this.postgres.kysely
            .updateTable("courses")
            .where("id", "=", id)
            .set(course)
            .executeTakeFirst();
        if (result.numUpdatedRows === 0n) return false;
        return true;
    }

    protected toEntity(
        course: Selectable<DB["courses"]>,
        members: Pick<Selectable<DB["userCourses"]>, "userId" | "isStaff">[]
    ): Course {
        return new Course(
            course,
            members.filter(m => m.isStaff).map(m => m.userId),
            members.filter(m => !m.isStaff).map(m => m.userId)
        );
    }
}
