import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import { ForbiddenError, HttpError, NotFoundError } from "../../api/errors";
import type { Course } from "../entity";
import type Homework from "../homework/entity";
import { NotificationSender } from "../../notifications/sender";
import { SubmissionReviewNotificationTemplate } from "./notifications";
import { CourseChangelog } from "../changes";
import { Postgres } from "../../infra/postgres";

@injectable()
export class ReviewHomework {
    public constructor(
        protected postgres: Postgres,
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
            content: string;
            accepted: boolean;
        }
    ): Promise<void | HttpError> {
        const permissions = course.getPermissionsFor(actor);
        if (permissions === null) return new NotFoundError("Course not found.");

        if (permissions.submissions.review !== true) {
            return new ForbiddenError(
                "You are not allowed to review homework submissions."
            );
        }

        await this.postgres.kysely
            .insertInto("homeworkSubmissionMessages")
            .values({
                homeworkId: homework.id,
                studentId: student.id,
                userId: actor.id,
                content: review.content,
                accepted: review.accepted
            })
            .execute();

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
