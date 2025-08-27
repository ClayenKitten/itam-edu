import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import {
    ConflictError,
    ForbiddenError,
    HttpError,
    NotFoundError
} from "../../api/errors";
import type { Course } from "../entity";
import type Homework from "../homework/entity";
import { NotificationSender } from "../../notifications/sender";
import { SubmissionReviewNotificationTemplate } from "./notifications";
import { CourseChangelog } from "../changes";
import type { SubmissionAttemptReview } from "./entity";
import { SubmissionRepository } from "./repository";

@injectable()
export class ReviewHomework {
    public constructor(
        protected repository: SubmissionRepository,
        protected notificationSender: NotificationSender,
        protected courseChangelog: CourseChangelog
    ) {}

    /** Reviews a homework submission. */
    public async invoke(
        actor: User,
        course: Course,
        homework: Homework,
        student: User,
        review: {
            accepted: boolean;
            content: string;
            files: string[];
        }
    ): Promise<void | HttpError> {
        const permissions = course.getPermissionsFor(actor);
        if (permissions === null) return new NotFoundError("Course not found.");
        if (permissions.submissions.review !== true) {
            return new ForbiddenError(
                "You are not allowed to review homework submissions."
            );
        }

        const submission = await this.repository.load(homework.id, student.id);
        if (!submission) {
            return new NotFoundError("Submission not found.");
        }
        if (submission.lastAttempt.review !== null) {
            return new ConflictError("Submission is already reviewed.");
        }
        submission.lastAttempt.review = {
            ...review,
            reviewerId: actor.id,
            sentAt: new Date()
        };
        await this.repository.save(submission);

        await Promise.allSettled([
            this.courseChangelog.add(actor, course, {
                kind: "submission-reviewed",
                homeworkId: homework.id,
                studentId: student.id,
                accepted: review.accepted
            }),
            this.notificationSender.send(
                new SubmissionReviewNotificationTemplate(
                    course,
                    homework,
                    student,
                    review.accepted
                ),
                [student.id]
            )
        ]);
    }
}
