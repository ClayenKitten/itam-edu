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
import { Postgres } from "itam-edu-core/infra/postgres";

@injectable()
export class SubmitHomework {
    public constructor(
        protected postgres: Postgres,
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

        await this.postgres.kysely
            .insertInto("homeworkSubmissionMessages")
            .values({
                homeworkId: homework.id,
                studentId: actor.id,
                content,
                userId: actor.id,
                accepted: null
            })
            .execute();

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
