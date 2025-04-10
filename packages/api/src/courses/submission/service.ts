import { BadRequestError, ForbiddenError } from "../../api/errors";
import type { AppConfig } from "../../config";
import type NotificationService from "../../notifications/service";
import type StaffRepository from "../../staff/repository";
import type { User } from "../../users/entity";
import type { Course } from "../entity";
import type Homework from "../homework/entity";
import type SubmissionRepository from "./repository";

export class SubmissionService {
    public constructor(
        private config: AppConfig,
        private db: {
            submission: SubmissionRepository;
            staff: StaffRepository;
        },
        private notification: NotificationService
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
            await this.db.submission.addSubmission(homework, student, content);
        } else {
            if (accepted === null) {
                return new BadRequestError("staff must set acceptance");
            }
            await this.db.submission.addReview(
                homework,
                student,
                actor,
                content,
                accepted
            );
        }

        if (senderRole === "student") {
            const staff = await this.db.staff.getAll(course);
            this.notification.send(
                [
                    "<b>📝 Новый ответ на задание</b>",
                    `Студент @${student.tgUsername} сдал(а) задание '${homework.title}'.`,
                    `<a href="${this.config.webUrl}${course.path}/homeworks/${homework.id}?student=${student.id}">🔗 Проверить</a>`
                ].join("\n\n"),
                staff.map(s => s.userId)
            );
        } else if (senderRole === "reviewer") {
            this.notification.send(
                [
                    `<b>${accepted ? "🥇 Задание сдано" : "📖 Задание нужно доработать"}</b>`,
                    accepted
                        ? `Ваш ответ на задание '${homework.title}' принят.`
                        : `В вашем ответе на задание '${homework.title}' есть недочёты.`,
                    `<a href="${this.config.webUrl}${course.path}/homeworks/${homework.id}">🔗 Посмотреть</a>`
                ].join("\n\n"),
                [student.id]
            );
        }
    }

    private getUserRole(
        actor: User,
        course: Course
    ): "student" | "reviewer" | null {
        if (
            actor.permissions.course(course.id)?.canManageSubmissions === true
        ) {
            return "reviewer";
        }
        if (actor.isCourseStudent(course.id)) {
            return "student";
        }
        return null;
    }
}
