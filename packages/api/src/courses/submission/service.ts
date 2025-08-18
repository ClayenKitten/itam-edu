import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import { BadRequestError, ForbiddenError } from "../../api/errors";
import type { Course } from "../entity";
import type Homework from "../homework/entity";
import { SubmissionRepository } from "./repository";
import { NotificationSender } from "../../notifications/sender";
import {
    SubmissionNotificationTemplate,
    SubmissionReviewNotificationTemplate
} from "./notifications";
import { CourseChangelog } from "../changes";

@injectable()
export class SubmissionService {
    public constructor(
        protected submissionRepo: SubmissionRepository,
        protected notificationSender: NotificationSender,
        protected courseChangelog: CourseChangelog
    ) {}

    public async sendMessage(
        actor: User,
        course: Course,
        homework: Homework,
        student: User,
        content: string,
        accepted: boolean | null
    ): Promise<void | BadRequestError | ForbiddenError> {
        const senderRole = this.getUserRole(actor, course);
        if (!senderRole) return new ForbiddenError();
        if (senderRole === "student") {
            if (accepted !== null) {
                return new BadRequestError(
                    "students can't set non-null acceptance"
                );
            }
            await this.submissionRepo.addSubmission(homework, student, content);
            await Promise.allSettled([
                this.courseChangelog.add(actor, course, {
                    kind: "submission-created",
                    homeworkId: homework.id,
                    studentId: student.id
                }),
                this.notificationSender.send(
                    new SubmissionNotificationTemplate(
                        course,
                        homework,
                        student
                    ),
                    course.staffIds
                )
            ]);
        } else {
            if (accepted === null) {
                return new BadRequestError("staff must set acceptance");
            }
            await this.submissionRepo.addReview(
                homework,
                student,
                actor,
                content,
                accepted
            );
            await Promise.allSettled([
                this.courseChangelog.add(actor, course, {
                    kind: "submission-reviewed",
                    homeworkId: homework.id,
                    studentId: student.id,
                    accepted
                }),
                this.notificationSender.send(
                    new SubmissionReviewNotificationTemplate(
                        course,
                        homework,
                        student,
                        accepted
                    ),
                    [student.id]
                )
            ]);
        }
    }

    private getUserRole(
        actor: User,
        course: Course
    ): "student" | "reviewer" | null {
        if (actor.hasCoursePermission(course.id, "canManageSubmissions")) {
            return "reviewer";
        }
        if (actor.isCourseStudent(course.id)) {
            return "student";
        }
        return null;
    }
}
