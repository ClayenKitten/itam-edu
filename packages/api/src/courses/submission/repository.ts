import type { Selectable } from "kysely";
import { Repository } from "../../db/repository";
import Submission, { type Review, type SubmissionInfo } from "./entity";
import * as schema from "./schema";
import type { DB } from "itam-edu-db";

export default class SubmissionRepository extends Repository {
    /** Returns homework submission. */
    public async getById(
        courseId: string,
        id: string
    ): Promise<Submission | null> {
        const submission = await this.db
            .selectFrom("homeworkSubmissions")
            .selectAll("homeworkSubmissions")
            .leftJoin("homeworks", "homeworkId", "homeworks.id")
            .where("courseId", "=", courseId)
            .where("id", "=", id)
            .executeTakeFirst();
        if (!submission) return null;
        return this.toEntity(submission);
    }

    /* Returns all homework submissions. */
    public async getAll(
        courseId: string,
        filters?: {
            student?: string;
            reviewed?: boolean | null;
            homework?: string;
        }
    ): Promise<Submission[]> {
        let query = this.db
            .selectFrom("homeworkSubmissions")
            .leftJoin("homeworks", "homeworkId", "homeworks.id")
            .where("homeworks.courseId", "=", courseId)
            .orderBy("createdAt")
            .selectAll("homeworkSubmissions");
        if (filters?.reviewed !== undefined) {
            if (filters.reviewed) {
                query = query.where("reviewAccepted", "is not", null);
            } else {
                query = query.where("reviewAccepted", "is", null);
            }
        }
        if (filters?.homework !== undefined) {
            query = query.where("homeworkId", "=", filters.homework);
        }
        if (filters?.student !== undefined) {
            query = query.where("studentId", "=", filters.student);
        }
        const results = await query.execute();
        return results.map(s => this.toEntity(s));
    }

    /**
     * Creates new homework submission.
     *
     * @returns Created submission.
     * */
    public async create(
        courseId: string,
        studentId: string,
        submissionInfo: typeof schema.createSubmission.static
    ): Promise<Submission | null> {
        const submission = await this.db
            .insertInto("homeworkSubmissions")
            .values({
                studentId: studentId,
                homeworkId: submissionInfo.homework,
                solution: submissionInfo.solution,
                studentComment: submissionInfo.comment
            })
            .returningAll()
            .executeTakeFirst();
        if (!submission) return null;
        return this.toEntity(submission);
    }

    /**
     * Sets or updates submission review.
     *
     * @returns Updated submission.
     * */
    public async review(
        reviewerId: string,
        courseId: string,
        submissionId: string,
        reviewInfo: typeof schema.createSubmissionReview.static
    ): Promise<Submission | null> {
        const submission = await this.db
            .updateTable("homeworkSubmissions")
            .set({
                reviewerId: reviewerId,
                reviewAccepted: reviewInfo.accepted,
                reviewerComment: reviewInfo.comment
            })
            .leftJoin("homeworks", "homeworkId", "homeworks.id")
            .where("courseId", "=", courseId)
            .where("id", "=", submissionId)
            .returningAll("homeworkSubmissions")
            .executeTakeFirst();
        if (!submission) return null;
        return this.toEntity(submission);
    }

    private toEntity(s: Selectable<DB["homeworkSubmissions"]>): Submission {
        const info: SubmissionInfo = {
            comment: s.studentComment,
            homework: s.homeworkId,
            solution: s.solution,
            student: s.studentId,
            submittedAt: s.submittedAt
        };
        const review: Review | null =
            s.reviewAccepted !== null
                ? {
                      accepted: s.reviewAccepted,
                      reviewer: s.reviewerId!,
                      comment: s.reviewerComment,
                      reviewedAt: s.reviewedAt!
                  }
                : null;
        return new Submission(s.id, info, review);
    }
}
