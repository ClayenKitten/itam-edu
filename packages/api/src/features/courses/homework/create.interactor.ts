import { injectable } from "inversify";
import { ForbiddenError, HttpError, NotFoundError } from "../../../api/errors";
import { CourseRepository } from "../repository";
import type { User } from "itam-edu-common";
import { HomeworkRepository } from "./repository";
import Homework from "./entity";
import * as schema from "./schema";
import { randomUUID } from "crypto";
import { CourseChangelog } from "../changes";
import { NotificationTemplate } from "../../notifications";
import type { Course } from "../entity";
import { NotificationSender } from "../../notifications/sender";

@injectable()
export class CreateHomework {
    public constructor(
        private courseRepo: CourseRepository,
        private repo: HomeworkRepository,
        private changelog: CourseChangelog,
        private notificationSender: NotificationSender
    ) {}

    public async invoke(
        actor: User,
        courseId: string,
        info: typeof schema.createHomework.static
    ): Promise<Homework | HttpError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }
        if (permissions.homeworks.edit !== true) {
            return new ForbiddenError(
                "You are not allowed to create homeworks."
            );
        }

        const newHomework = new Homework(
            randomUUID(),
            courseId,
            info.title,
            info.content,
            info.deadline,
            info.deadlineOverride,
            new Date()
        );
        await this.repo.save(newHomework);

        await Promise.allSettled([
            this.notificationSender.send(
                new Notification(course, newHomework),
                [...course.members.map(m => m.id)]
            ),
            this.changelog.add(actor, course, {
                kind: "homework-created",
                homeworkId: newHomework.id
            })
        ]);

        return newHomework;
    }
}

class Notification extends NotificationTemplate {
    public constructor(
        protected course: Course,
        protected homework: Homework
    ) {
        super();
    }

    public override toWeb(id: string, _userId: string) {
        return {
            id,
            timestamp: Date.now(),
            courseId: this.course.id,
            title: `Новое задание '${this.homework.title}'`,
            icon: "books",
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
        const header = `<b>📚 Новое задание '${this.homework.title}'</b>`;
        const deadlineLine =
            this.homework.deadline !== null
                ? `📅 Предоставить ответ нужно до ${this.printDate(this.homework.deadline)}.`
                : "📅 Предоставить ответ можно без ограничений по времени.";
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
