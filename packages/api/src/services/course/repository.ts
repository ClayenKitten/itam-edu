import type { DB } from "itam-edu-db";
import { type Kysely, type NotNull, sql } from "kysely";

export default class CourseRepository {
    constructor(private db: Kysely<DB>) {}

    public async getCourses() {
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

    public async getCourse(id: string) {
        return await this.db
            .selectFrom("courses")
            .selectAll()
            .where("id", "=", id)
            .executeTakeFirst();
    }

    public async lookupCourse(params: {
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

    public async getLessons(courseId: string) {
        const lessons = await this.db
            .selectFrom("lessons")
            .select(["courseId", "slug", "position", "icon", "title"])
            .where("courseId", "=", courseId)
            .orderBy("position asc")
            .execute();
        return lessons;
    }

    public async getLesson(courseId: string, lessonSlug: string) {
        return await this.db
            .selectFrom("lessons")
            .select([
                "courseId",
                "slug",
                "position",
                "icon",
                "title",
                "content"
            ])
            .where("courseId", "=", courseId)
            .where("slug", "=", lessonSlug)
            .executeTakeFirst();
    }

    public async getCourseStudents(courseId: string) {
        return await this.db
            .selectFrom("courseStudents")
            .where("courseId", "=", courseId)
            .leftJoin("users", "users.id", "courseStudents.userId")
            .orderBy("tgUsername asc")
            .select([
                "id",
                "tgUsername",
                "firstName",
                "lastName",
                "patronim",
                "email",
                "avatar"
            ])
            .execute();
    }
}
