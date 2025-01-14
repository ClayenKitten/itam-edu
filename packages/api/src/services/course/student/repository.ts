import type { DB } from "itam-edu-db";
import { type Kysely } from "kysely";

export default class StudentRepository {
    constructor(private db: Kysely<DB>) {}

    public async getAll(courseId: string) {
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
