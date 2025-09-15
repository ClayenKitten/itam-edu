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
import { CourseRepository } from "../repository";
import { UserRepository } from "../../users/repository";
import { HomeworkRepository } from "../homework/repository";
import { NotificationTemplate } from "../../notifications";

@injectable()
export class ReviewHomework {
    public constructor(
        private courseRepo: CourseRepository,
        private userRepo: UserRepository,
        private homeworkRepo: HomeworkRepository,
        private repository: SubmissionRepository,
        private notificationSender: NotificationSender,
        private courseChangelog: CourseChangelog
    ) {}

    /** Reviews a homework submission. */
    public async invoke(
        actor: User,
        courseId: string,
        homeworkId: string,
        studentId: string,
        review: {
            accepted: boolean;
            content: string;
            files: string[];
        }
    ): Promise<void | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course not found.");
        }
        if (permissions.submissions.review !== true) {
            return new ForbiddenError(
                "You are not allowed to review homework submissions."
            );
        }

        const [homework, student] = await Promise.all([
            this.homeworkRepo.load(course.id, homeworkId),
            this.userRepo.getById(studentId)
        ]);
        if (!homework) {
            return new NotFoundError("Homework not found.");
        }
        if (!student) {
            return new NotFoundError("Student not found.");
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
                new Notification(course, homework, student, review.accepted),
                [student.id]
            )
        ]);
    }
}

class Notification extends NotificationTemplate {
    public constructor(
        private course: Course,
        private homework: Homework,
        private _student: User,
        private accepted: boolean
    ) {
        super();
    }

    public override toWeb(id: string, _userId: string) {
        const title = this.accepted
            ? `Задание '${this.homework.title}' сдано.`
            : `Задание '${this.homework.title}' нужно доработать.`;

        return {
            id,
            timestamp: Date.now(),
            courseId: this.course.id,
            title,
            icon: "exam",
            url: `${this.course.path}/homeworks/${this.homework.id}`
        };
    }

    public override toTelegram(id: string, _userId: string) {
        return {
            id,
            text: this.html,
            link: {
                text: "🔗 Посмотреть",
                url: `${this.course.path}/homeworks/${this.homework.id}`
            }
        };
    }

    protected get html() {
        if (this.accepted) {
            return [
                "<b>🥇 Задание сдано</b>",
                `Ваш ответ на задание '${this.homework.title}' принят.`
            ].join("\n\n");
        } else {
            return [
                "<b>📖 Задание нужно доработать</b>",
                `В вашем ответе на задание '${this.homework.title}' есть недочёты.`
            ].join("\n\n");
        }
    }
}
