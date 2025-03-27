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
    ): Promise<typeof schema.student.static> {
        const newStudent = await this.db
            .insertInto("courseStudents")
            .values({
                courseId: courseId,
                userId: userId
            })
            .returning(schemaFields(schema.student))
            .executeTakeFirstOrThrow();
        return newStudent;
    }
    public async removeStudent(
        courseId: string,
        userId: string
    ): Promise<void> {
        await this.db
            .deleteFrom("courseStudents")
            .where("courseId", "=", courseId)
            .where("userId", "=", userId)
            .execute();
    }
    private async getStudent(
        courseId: string,
        userId: string
    ): Promise<typeof schema.student.static | null> {
        const student = await this.db
            .selectFrom("courseStudents")
            .select(schemaFields(schema.student))
            .where("courseId", "=", courseId)
            .where("userId", "=", userId)
            .executeTakeFirst();
        return student ?? null;
    }
}
