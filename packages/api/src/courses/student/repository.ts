import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import type { Course } from "../entity";
import { Postgres } from "../../infra/postgres";

@injectable()
export class StudentRepository {
    public constructor(protected postgres: Postgres) {}

    /** Returns ids of all enrolled students. */
    public async getAll(course: Course): Promise<string[]> {
        const students = await this.postgres.kysely
            .selectFrom("userCourses")
            .select(["userCourses.userId"])
            .leftJoin("users", "userCourses.userId", "users.id")
            .where("userCourses.isStaff", "=", false)
            .where("userCourses.courseId", "=", course.id)
            .orderBy("tgUsername asc")
            .execute();
        return students.map(s => s.userId);
    }

    /**
     * Adds user to the student list.
     *
     * @returns `true` if student is added, and `false` if it was already in the list.
     * */
    public async set(course: Course, user: User): Promise<boolean> {
        const result = await this.postgres.kysely
            .insertInto("userCourses")
            .values({ courseId: course.id, userId: user.id, isStaff: false })
            .onConflict(cb =>
                cb.columns(["userId", "courseId"]).doUpdateSet({
                    isStaff: false,
                    title: null,
                    canEditContent: false,
                    canEditInfo: false,
                    canManageSubmissions: false,
                    isOwner: false
                })
            )
            .executeTakeFirst();
        return (result.numInsertedOrUpdatedRows ?? 0) > 0n;
    }

    /**
     * Removes user from the student list.
     *
     * @returns `true` if student is removed, and `false` otherwise.
     * */
    public async remove(course: Course, user: User): Promise<boolean> {
        const result = await this.postgres.kysely
            .deleteFrom("userCourses")
            .where("courseId", "=", course.id)
            .where("userId", "=", user.id)
            .where("userCourses.isStaff", "=", false)
            .executeTakeFirst();
        return result.numDeletedRows > 0n;
    }
}
