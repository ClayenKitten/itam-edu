import { injectable } from "inversify";
import { sql, type Selectable } from "kysely";
import * as schema from "./schema";
import { schemaFields } from "../../util";
import { Course } from "./entity";
import { Postgres } from "../../infra/postgres";
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
            .select(["userId", "role"])
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
            .select(["userId", "role"])
            .execute();

        return this.toEntity(courseInfo, members);
    }

    /** Returns all courses. */
    public async getAll(): Promise<Course[]> {
        const courseInfos = await this.postgres.kysely
            .selectFrom("courses")
            .select(schemaFields(schema.course))
            .orderBy("year desc")
            .orderBy("semester asc")
            .orderBy("title asc")
            .orderBy("slug asc")
            .execute();
        if (courseInfos.length === 0) return [];

        const members = await this.postgres.kysely
            .selectFrom("userCourses")
            .where(
                "courseId",
                "in",
                courseInfos.map(c => c.id)
            )
            .select(["courseId", "userId", "role"])
            .execute();

        const membersByCourse = new Map<
            string,
            Selectable<DB["userCourses"]>[]
        >();
        for (const member of members) {
            if (!membersByCourse.has(member.courseId)) {
                membersByCourse.set(member.courseId, []);
            }
            membersByCourse.get(member.courseId)!.push(member);
        }
        return courseInfos.map(c =>
            this.toEntity(c, membersByCourse.get(c.id) ?? [])
        );
    }

    protected toEntity(
        course: Selectable<DB["courses"]>,
        members: Pick<Selectable<DB["userCourses"]>, "userId" | "role">[]
    ): Course {
        return new Course(
            course,
            members.map(m => ({ id: m.userId, role: m.role }))
        );
    }
}
