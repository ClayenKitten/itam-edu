import { Repository } from "../../db/repository";
import { schemaFields } from "../../util";
import * as schema from "./schema";
import type { User } from "itam-edu-common";
import type { Course } from "../entity";

export default class StudentRepository extends Repository {
    /** Returns ids of all enrolled students. */
    public async getAll(
        course: Course
    ): Promise<(typeof schema.enrollment.static)[]> {
        const students = await this.db
            .selectFrom("courseStudents")
            .select(["userId", "courseId"])
            .leftJoin("users", "courseStudents.userId", "users.id")
            .where("courseStudents.courseId", "=", course.id)
            .orderBy("tgUsername asc")
            .execute();
        return students;
    }

    /** Adds user to the student list. */
    public async add(
        course: Course,
        user: User
    ): Promise<typeof schema.enrollment.static | null> {
        const newStudent = await this.db
            .insertInto("courseStudents")
            .values({ courseId: course.id, userId: user.id })
            .onConflict(cb => cb.doNothing())
            .returning(schemaFields(schema.enrollment))
            .executeTakeFirst();
        if (!newStudent) return null;
        return newStudent;
    }

    /** Removes user from the student list. */
    public async remove(course: Course, user: User): Promise<boolean> {
        const result = await this.db
            .deleteFrom("courseStudents")
            .where("courseId", "=", course.id)
            .where("userId", "=", user.id)
            .executeTakeFirst();
        return result.numDeletedRows > 0n;
    }
}
