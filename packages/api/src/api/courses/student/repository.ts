import { Repository } from "../../../db/repository";
import { schemaFields } from "../../../util";
import * as userSchema from "../../users/schema";

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
}
