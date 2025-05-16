import { injectable } from "inversify";
import { Postgres } from "../../infra/postgres";
import type { User } from "itam-edu-common";
import type Homework from "../homework/entity";

@injectable()
export class SubmissionRepository {
    public constructor(protected postgres: Postgres) {}

    /** Creates new homework submission. */
    public async addSubmission(
        homework: Homework,
        student: User,
        content: string
    ): Promise<void> {
        await this.postgres.kysely
            .insertInto("homeworkSubmissionMessages")
            .values({
                homeworkId: homework.id,
                studentId: student.id,
                content,
                userId: student.id,
                accepted: null
            })
            .execute();
    }

    /** Creates new homework review. */
    public async addReview(
        homework: Homework,
        student: User,
        staff: User,
        content: string,
        accepted: boolean
    ): Promise<void> {
        await this.postgres.kysely
            .insertInto("homeworkSubmissionMessages")
            .values({
                homeworkId: homework.id,
                studentId: student.id,
                content,
                userId: staff.id,
                accepted
            })
            .execute();
    }
}
