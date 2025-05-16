import { injectable } from "inversify";
import type { User } from "itam-edu-common";
import { BadRequestError, ForbiddenError } from "../../api/errors";
import type { Course } from "../entity";
import type Homework from "../homework/entity";
import { AppConfig } from "../../config";
import { SubmissionRepository } from "./repository";
import { StaffRepository } from "../../staff/repository";
import { NotificationService } from "../../notifications/service";

@injectable()
export class SubmissionService {
    public constructor(
        protected config: AppConfig,
        protected submissionRepo: SubmissionRepository,
        protected staffRepo: StaffRepository,
        protected notificationService: NotificationService
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
        }

        if (senderRole === "student") {
            const staff = await this.staffRepo.getAll(course);
            this.notificationService.send(
                [
                    "<b>📝 Новый ответ на задание</b>",
                    `Студент @${student.telegram.username} сдал(а) задание '${homework.title}'.`,
                    `<a href="${this.config.webUrl}${course.path}/homeworks/${homework.id}?student=${student.id}">🔗 Проверить</a>`
                ].join("\n\n"),
                staff.map(s => s.userId)
            );
        } else if (senderRole === "reviewer") {
            this.notificationService.send(
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
        if (actor.hasCoursePermission(course.id, "canManageSubmissions")) {
            return "reviewer";
        }
        if (actor.isCourseStudent(course.id)) {
            return "student";
        }
        return null;
    }
}
