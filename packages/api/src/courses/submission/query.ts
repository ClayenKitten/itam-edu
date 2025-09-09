import { injectable } from "inversify";
import { Postgres } from "../../infra/postgres";
import {
    ForbiddenError,
    HttpError,
    NotFoundError,
    UnauthorizedError
} from "../../api/errors";
import type { User } from "itam-edu-common";
import type { Course } from "../entity";
import type { SubmissionAttempt } from "./entity";
import { CourseRepository } from "../repository";

@injectable()
export class SubmissionQuery {
    public constructor(
        private courseRepo: CourseRepository,
        private postgres: Postgres
    ) {}

    public async get(
        actor: User,
        courseId: string,
        homeworkId: string,
        studentId: string
    ): Promise<SubmissionDto | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course not found.");
        }
        if (!permissions.submissions.view && actor.id !== studentId) {
            return new ForbiddenError(
                "You are not allowed to view submissions."
            );
        }

        const attempts = await this.postgres.kysely
            .selectFrom("submissionAttempts as attempts")
            .leftJoin(
                "submissionReviews as reviews",
                "reviews.attemptId",
                "attempts.id"
            )
            .leftJoin("homeworks", "attempts.homeworkId", "homeworks.id")
            .where("homeworks.courseId", "=", course.id)
            .select([
                "attempts.id",
                "attempts.content",
                "attempts.files",
                "attempts.sentAt",
                "reviews.reviewerId",
                "reviews.accepted",
                "reviews.content as reviewContent",
                "reviews.files as reviewFiles",
                "reviews.sentAt as reviewSentAt"
            ])
            .where("attempts.studentId", "=", studentId)
            .where("attempts.homeworkId", "=", homeworkId)
            .orderBy("attempts.sentAt desc")
            .execute();
        if (attempts.length === 0) {
            return new NotFoundError("Student has not submitted the homework.");
        }

        const details = await this.postgres.kysely
            .selectFrom("submissionAttempts")
            .innerJoin(
                "homeworks",
                "homeworks.id",
                "submissionAttempts.homeworkId"
            )
            .innerJoin("users", "users.id", "submissionAttempts.studentId")
            .select([
                "homeworks.id as homeworkId",
                "homeworks.title",
                "users.id as studentId",
                "users.firstName",
                "users.lastName",
                "users.avatar",
                "users.tgUsername"
            ])
            .where("submissionAttempts.studentId", "=", studentId)
            .where("submissionAttempts.homeworkId", "=", homeworkId)
            .limit(1)
            .executeTakeFirst();
        if (details === undefined) {
            return new NotFoundError("Student has not submitted the homework.");
        }

        return {
            homework: {
                id: details.homeworkId,
                title: details.title
            },
            student: {
                id: details.studentId,
                firstName: details.firstName,
                lastName: details.lastName,
                avatar: details.avatar,
                tgUsername: details.tgUsername
            },
            attempts: attempts.map(a => ({
                id: a.id,
                content: a.content,
                files: a.files,
                sentAt: a.sentAt,
                review:
                    a.accepted !== null
                        ? {
                              reviewerId: a.reviewerId,
                              accepted: a.accepted!,
                              content: a.reviewContent,
                              files: a.reviewFiles!,
                              sentAt: a.reviewSentAt!
                          }
                        : null
            }))
        };
    }

    public async getAll(
        actor: User,
        courseId: string,
        filters?: {
            homework?: string;
            student?: string;
            accepted?: boolean | null;
        }
    ): Promise<SubmissionPartialDto[] | UnauthorizedError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course not found.");
        }

        const isCheckingSelf = filters?.student && actor.id === filters.student;
        if (!permissions.submissions.view && !isCheckingSelf) {
            return new ForbiddenError(
                "You are not allowed to view submissions."
            );
        }

        const subq = this.postgres.kysely
            .selectFrom("submissionAttempts as attempts")
            .distinctOn(["attempts.studentId", "attempts.homeworkId"])
            .orderBy("attempts.studentId")
            .orderBy("attempts.homeworkId")
            .orderBy("attempts.sentAt desc")
            .leftJoin(
                "submissionReviews as reviews",
                "attempts.id",
                "reviews.attemptId"
            )
            .leftJoin("homeworks", "attempts.homeworkId", "homeworks.id")
            .where("homeworks.courseId", "=", course.id)
            .$if(filters?.homework !== undefined, qb =>
                qb.where("attempts.homeworkId", "=", filters!.homework!)
            )
            .$if(filters?.student !== undefined, qb =>
                qb.where("attempts.studentId", "=", filters!.student!)
            )
            .select(eb => [
                "attempts.studentId",
                "attempts.homeworkId",
                "reviews.accepted",
                eb.fn
                    .coalesce("reviews.sentAt", "attempts.sentAt")
                    .as("lastUpdatedAt")
            ])
            .as("latest");

        const result = await this.postgres.kysely
            .selectFrom(subq)
            .innerJoin("users", "studentId", "users.id")
            .innerJoin("homeworks", "homeworkId", "homeworks.id")
            .$if(filters?.accepted !== undefined, qb =>
                qb.where(
                    "latest.accepted",
                    "is not distinct from",
                    filters!.accepted!
                )
            )
            .select([
                "homeworkId",
                "homeworks.title as homeworkTitle",
                "studentId",
                "users.firstName",
                "users.lastName",
                "users.avatar",
                "users.tgUsername",
                "latest.accepted",
                "latest.lastUpdatedAt"
            ])
            .orderBy("lastUpdatedAt desc")
            .execute();

        return result.map(row => {
            return {
                homework: {
                    id: row.homeworkId,
                    title: row.homeworkTitle
                },
                student: {
                    id: row.studentId,
                    firstName: row.firstName,
                    lastName: row.lastName,
                    avatar: row.avatar,
                    tgUsername: row.tgUsername
                },
                accepted: row.accepted,
                lastUpdatedAt: row.lastUpdatedAt
            };
        });
    }
}

export type SubmissionDto = {
    homework: {
        id: string;
        title: string;
    };
    student: {
        id: string;
        firstName: string;
        lastName: string | null;
        tgUsername: string;
        avatar: string | null;
    };
    attempts: SubmissionAttempt[];
};

export type SubmissionPartialDto = {
    homework: {
        id: string;
        title: string;
    };
    student: {
        id: string;
        firstName: string;
        lastName: string | null;
        tgUsername: string;
        avatar: string | null;
    };
    accepted: boolean | null;
    lastUpdatedAt: Date;
};
