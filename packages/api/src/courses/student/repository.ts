import { Repository } from "../../db/repository";
import { schemaFields } from "../../util";
import * as userSchema from "../../users/schema";
import * as schema from "./schema";

export default class StudentRepository extends Repository {
    public async getAll(
        courseId: string
    ): Promise<(typeof userSchema.user.static)[]> {
        const students = await this.db
            .selectFrom("users")
            .leftJoin("courseStudents", "users.id", "courseStudents.userId")
            .where("courseStudents.courseId", "=", courseId)
            .orderBy("tgUsername asc")
            .select(schemaFields(userSchema.user))
            .execute();
        return students;
    }

    public async addStudent(
        courseId: string,
        userId: string
    ): Promise<typeof schema.student.static | null> {
        const newStudent = await this.db
            .insertInto("courseStudents")
            .values({
                courseId: courseId,
                userId: userId
            })
            .onConflict(cb => cb.doNothing())
            .returning(schemaFields(schema.student))
            .executeTakeFirst();
        if (!newStudent) return null;
        return newStudent;
    }

    public async expelStudent(
        courseId: string,
        userId: string
    ): Promise<boolean> {
        const result = await this.db
            .deleteFrom("courseStudents")
            .where("courseId", "=", courseId)
            .where("userId", "=", userId)
            .executeTakeFirst();
        return result.numDeletedRows > 0n;
    }
}
