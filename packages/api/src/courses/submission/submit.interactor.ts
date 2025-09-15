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
import { CourseChangelog } from "../changes";
import { SubmissionRepository } from "./repository";
import { randomUUID } from "crypto";
import { Submission } from "./entity";
import { CourseRepository } from "../repository";
import { HomeworkRepository } from "../homework/repository";
import { NotificationTemplate } from "../../notifications";

@injectable()
export class SubmitHomework {
    public constructor(
        private courseRepo: CourseRepository,
        private homeworkRepo: HomeworkRepository,
        private repository: SubmissionRepository,
        private notificationSender: NotificationSender,
        private courseChangelog: CourseChangelog
    ) {}

    /** Creates new homework submission. */
    public async invoke(
        actor: User,
        courseId: string,
        homeworkId: string,
        content: string
    ): Promise<void | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course not found.");
        }
        if (permissions.submissions.create !== true) {
            return new ForbiddenError(
                "You are not allowed to create homework submissions."
            );
        }

        const homework = await this.homeworkRepo.load(course.id, homeworkId);
        if (!homework) {
            return new NotFoundError("Homework not found.");
        }
        if (homework.isSubmissionOpen !== true) {
            return new ConflictError("Homework does not accept submissions.");
        }

        let submission = await this.repository.load(homework.id, actor.id);
        if (submission !== null && submission.lastAttempt.review === null) {
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
                new Notification(course, homework, actor),
                course.members.filter(m => m.role !== "student").map(m => m.id)
            )
        ]);
    }
}

class Notification extends NotificationTemplate {
    public constructor(
        private course: Course,
        private homework: Homework,
        private student: User
    ) {
        super();
    }

    public override toWeb(id: string, _userId: string) {
        return {
            id,
            timestamp: Date.now(),
            courseId: this.course.id,
            title: `Студент @${this.student.telegram.username} отправил задание '${this.homework.title}'.`,
            icon: "scroll",
            url: `${this.course.path}/homeworks/${this.homework.id}?student=${this.student.id}`
        };
    }

    public override toTelegram(id: string, _userId: string) {
        return {
            id,
            text: [
                "<b>📝 Новый ответ на задание</b>",
                `Студент @${this.student.telegram.username} сдал(а) задание '${this.homework.title}'.`
            ].join("\n\n"),
            link: {
                text: "🔗 Проверить",
                url: `${this.course.path}/homeworks/${this.homework.id}/review/${this.student.id}`
            }
        };
    }
}
