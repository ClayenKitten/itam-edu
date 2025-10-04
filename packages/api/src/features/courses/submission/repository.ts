import { injectable } from "inversify";
import { Submission, type SubmissionAttempt } from "./entity";
import { Postgres } from "../../../infra/postgres";

@injectable()
export class SubmissionRepository {
    public constructor(protected postgres: Postgres) {}

    /** Loads submission from the database. */
    public async load(
        homeworkId: string,
        studentId: string
    ): Promise<Submission | null> {
        const submission_attempts = await this.postgres.kysely
            .selectFrom("submissionAttempts as attempts")
            .leftJoin(
                "submissionReviews as reviews",
                "attempts.id",
                "reviews.attemptId"
            )
            .where("attempts.homeworkId", "=", homeworkId)
            .where("attempts.studentId", "=", studentId)
            .orderBy("attempts.sentAt desc")
            .selectAll("attempts")
            .select([
                "reviews.accepted",
                "reviews.content as reviewContent",
                "reviews.files as reviewFiles",
                "reviews.reviewerId",
                "reviews.sentAt as reviewSentAt"
            ])
            .execute();
        if (submission_attempts.length === 0) {
            return null;
        }

        return new Submission(
            homeworkId,
            studentId,
            submission_attempts.map(attempt => ({
                id: attempt.id,
                content: attempt.content,
                files: attempt.files,
                sentAt: attempt.sentAt,
                review:
                    attempt.accepted !== null
                        ? {
                              accepted: attempt.accepted!,
                              content: attempt.reviewContent,
                              files: attempt.reviewFiles!,
                              reviewerId: attempt.reviewerId,
                              sentAt: attempt.reviewSentAt!
                          }
                        : null
            }))
        );
    }

    /** Saves submission to the database. */
    public async save(submission: Submission): Promise<void> {
        const { homeworkId, studentId, attempts } = submission;

        await this.postgres.kysely.transaction().execute(async trx => {
            await trx
                .insertInto("submissionAttempts")
                .values(
                    attempts.map(a => ({
                        id: a.id,
                        homeworkId,
                        studentId,
                        content: a.content,
                        files: a.files,
                        sentAt: a.sentAt
                    }))
                )
                .onConflict(oc =>
                    oc.column("id").doUpdateSet(eb => ({
                        content: eb.ref("excluded.content"),
                        files: eb.ref("excluded.files"),
                        sentAt: eb.ref("excluded.sentAt")
                    }))
                )
                .execute();

            const reviews = attempts
                .filter(a => a.review)
                .map(a => ({
                    attemptId: a.id,
                    accepted: a.review!.accepted,
                    content: a.review!.content,
                    files: a.review!.files,
                    reviewerId: a.review!.reviewerId,
                    sentAt: a.review!.sentAt
                }));
            if (reviews.length > 0) {
                await trx
                    .insertInto("submissionReviews")
                    .values(reviews)
                    .onConflict(oc =>
                        oc.column("attemptId").doUpdateSet(eb => ({
                            accepted: eb.ref("excluded.accepted"),
                            content: eb.ref("excluded.content"),
                            files: eb.ref("excluded.files"),
                            reviewerId: eb.ref("excluded.reviewerId"),
                            sentAt: eb.ref("excluded.sentAt")
                        }))
                    )
                    .execute();
            }
        });
    }

    public async loadForStudent(
        studentId: string,
        courseId: string
    ): Promise<Submission[]> {
        const attempts = await this.postgres.kysely
            .selectFrom("submissionAttempts")
            .innerJoin(
                "homeworks",
                "homeworks.id",
                "submissionAttempts.homeworkId"
            )
            .where("submissionAttempts.studentId", "=", studentId)
            .where("homeworks.courseId", "=", courseId)
            .select([
                "submissionAttempts.id",
                "submissionAttempts.content",
                "submissionAttempts.files",
                "submissionAttempts.sentAt",
                "submissionAttempts.homeworkId"
            ])
            .execute();

        const attemptIds = attempts.map(a => a.id);
        const reviews = await this.postgres.kysely
            .selectFrom("submissionReviews")
            .where("submissionReviews.attemptId", "in", attemptIds)
            .select([
                "submissionReviews.attemptId",
                "submissionReviews.accepted",
                "submissionReviews.content",
                "submissionReviews.files",
                "submissionReviews.reviewerId",
                "submissionReviews.sentAt"
            ])
            .execute();
        const submissionsMap = new Map<string, Submission>();
        for (const attempt of attempts) {
            const review =
                reviews.find(r => r.attemptId === attempt.id) ?? null;
            const attemptData: SubmissionAttempt = {
                id: attempt.id,
                content: attempt.content,
                files: attempt.files,
                sentAt: attempt.sentAt,
                review: review
                    ? {
                          accepted: review.accepted,
                          content: review.content,
                          files: review.files,
                          reviewerId: review.reviewerId,
                          sentAt: review.sentAt
                      }
                    : null
            };
            if (!submissionsMap.has(attempt.homeworkId)) {
                submissionsMap.set(
                    attempt.homeworkId,
                    new Submission(attempt.homeworkId, studentId, [attemptData])
                );
            } else {
                submissionsMap
                    .get(attempt.homeworkId)!
                    .attempts.unshift(attemptData);
            }
        }
        const submissions = [...submissionsMap.values()];
        return submissions;
    }
}
