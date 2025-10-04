import { injectable } from "inversify";
import { ForbiddenError, HttpError, NotFoundError } from "../../../api/errors";
import { CourseRepository } from "../repository";
import type { User } from "itam-edu-common";
import { HomeworkRepository } from "./repository";
import Homework from "./entity";
import * as schema from "./schema";
import { CourseChangelog } from "../changes";
import type { Course } from "../entity";
import { NotificationTemplate } from "../../notifications";
import { NotificationSender } from "../../notifications/sender";

@injectable()
export class UpdateHomework {
    public constructor(
        private courseRepo: CourseRepository,
        private repo: HomeworkRepository,
        private notificationSender: NotificationSender,
        private changelog: CourseChangelog
    ) {}

    public async invoke(
        actor: User,
        courseId: string,
        homeworkId: string,
        changes: typeof schema.updateHomework.static
    ): Promise<Homework | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }
        if (permissions.homeworks.edit !== true) {
            return new ForbiddenError("You are not allowed to edit homeworks.");
        }

        const homework = await this.repo.load(courseId, homeworkId);
        if (homework === null) return new NotFoundError("Homework not found.");

        const newHomework = new Homework(
            homework.id,
            homework.courseId,
            changes.title,
            changes.content,
            changes.deadline,
            changes.deadlineOverride,
            homework.createdAt
        );
        await this.repo.save(newHomework);

        if (homework.deadline !== newHomework.deadline) {
            await Promise.allSettled([
                this.notificationSender.send(
                    new Notification(course, homework),
                    [...course.members.map(m => m.id)]
                ),
                this.changelog.add(actor, course, {
                    kind: "homework-deadline-changed",
                    homeworkId: homework.id
                })
            ]);
        }

        return newHomework;
    }
}

class Notification extends NotificationTemplate {
    public constructor(
        private course: Course,
        private homework: Homework
    ) {
        super();
    }

    public override toWeb(id: string, _userId: string) {
        return {
            id,
            timestamp: Date.now(),
            courseId: this.course.id,
            title: `Дедлайн задания '${this.homework.title}' изменён.`,
            icon: "alarm",
            url: `${this.course.path}/homeworks/${this.homework.id}`
        };
    }

    public override toTelegram(id: string, _userId: string) {
        return {
            id,
            text: this.html,
            link: {
                text: "🔗 Страница задания",
                url: `${this.course.path}/homeworks/${this.homework.id}`
            }
        };
    }

    protected get html(): string {
        const header = `<b>⏰ Дедлайн задания '${this.homework.title}' изменён</b>.`;
        const deadlineLine =
            this.homework.deadline !== null
                ? `📅 Теперь предоставить ответ нужно до ${this.printDate(this.homework.deadline)}`
                : "📅 Теперь предоставить ответ можно без ограничений по времени";
        return [header, deadlineLine].join("\n\n");
    }

    protected printDate(date: Date) {
        return date.toLocaleString("ru-RU", {
            timeZone: "Europe/Moscow",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            hourCycle: "h24",
            minute: "2-digit"
        });
    }
}
