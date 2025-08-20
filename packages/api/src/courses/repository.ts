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
        semester?: "spring" | "autumn" | null
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
            query = query.where("semester", "is not distinct from", semester);
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
