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
import { SubmissionNotificationTemplate } from "./notifications";
import { CourseChangelog } from "../changes";
import { SubmissionRepository } from "./repository";
import { randomUUID } from "crypto";
import { Submission } from "./entity";

@injectable()
export class SubmitHomework {
    public constructor(
        protected repository: SubmissionRepository,
        protected notificationSender: NotificationSender,
        protected courseChangelog: CourseChangelog
    ) {}

    /** Creates new homework submission. */
    public async invoke(
        actor: User,
        course: Course,
        homework: Homework,
        content: string
    ): Promise<void | HttpError> {
        const permissions = course.getPermissionsFor(actor);
        if (permissions === null) return new NotFoundError("Course not found.");

        if (permissions.submissions.create !== true) {
            return new ForbiddenError(
                "You are not allowed to create homework submissions."
            );
        }
        if (!homework.isSubmissionOpen) {
            return new ConflictError("Homework does not accept submissions.");
        }

        let submission = await this.repository.load(homework.id, actor.id);
        if (submission && submission.lastAttempt.review === null) {
            return new ConflictError("Submission is not reviewed yet.");
        }

        const attempt = {
            id: randomUUID(),
            content,
            files: [],
            review: null,
            sentAt: new Date()
        };
        if (!submission) {
            submission = new Submission(homework.id, actor.id, [attempt]);
        } else {
            submission.attempts.push(attempt);
        }
        await this.repository.save(submission);

        await Promise.allSettled([
            this.courseChangelog.add(actor, course, {
                kind: "submission-created",
                homeworkId: homework.id,
                studentId: actor.id
            }),
            this.notificationSender.send(
                new SubmissionNotificationTemplate(course, homework, actor),
                course.members.filter(m => m.role !== "student").map(m => m.id)
            )
        ]);
    }
}
