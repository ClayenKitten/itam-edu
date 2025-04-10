import { Repository } from "../../db/repository";
import type { User } from "../../users/entity";
import type Homework from "../homework/entity";

export default class SubmissionRepository extends Repository {
    /** Creates new homework submission. */
    public async addSubmission(
        homework: Homework,
        student: User,
        content: string
    ): Promise<void> {
        await this.db
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
        await this.db
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
