import { injectable } from "inversify";
import { NotFoundError, UnauthorizedError } from "../../../api/errors";
import { NotificationSender } from "../../notifications/sender";
import type { User } from "itam-edu-common";
import { Lesson } from "./entity";
import { LessonRepository } from "./repository";
import * as schema from "./schema";
import { randomUUID } from "crypto";
import { CourseChangelog } from "../changes";
import { CourseRepository } from "../repository";
import { NotificationTemplate } from "../../notifications";
import type { Course } from "../entity";

@injectable()
export class CreateLesson {
    public constructor(
        private repo: LessonRepository,
        private courseRepo: CourseRepository,
        private notificationSender: NotificationSender,
        private changelog: CourseChangelog
    ) {}

    /** Creates new lesson. */
    public async invoke(
        actor: User,
        courseId: string,
        data: typeof schema.createLesson.static
    ): Promise<Lesson | UnauthorizedError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }
        if (permissions.lessons.edit !== true) {
            return new UnauthorizedError(
                "You are not allowed to create lessons."
            );
        }

        const newLesson = new Lesson(
            randomUUID(),
            course.id,
            {
                title: data.title,
                description: data.description,
                banner: null,
                video: null
            },
            data.content,
            data.homeworkIds,
            data.schedule
        );

        await this.repo.save(newLesson);
        await Promise.all([
            this.notificationSender.send(new Notification(course, newLesson), [
                ...course.members.map(m => m.id)
            ]),
            this.changelog.add(actor, course, {
                kind: "lesson-created",
                lessonId: newLesson.id
            })
        ]);
        return newLesson;
    }
}

class Notification extends NotificationTemplate {
    public constructor(
        private course: Course,
        private lesson: Lesson
    ) {
        super();
    }

    public toWeb(id: string, _userId: string) {
        return {
            id,
            timestamp: Date.now(),
            courseId: this.course.id,
            title: `Новый урок '${this.lesson.info.title}'`,
            icon: "folder-plus",
            url: `${this.course.path}/lessons/${this.lesson.id}`
        };
    }

    public toTelegram(id: string, _userId: string) {
        return {
            id,
            text: this.html,
            link: {
                text: "🔗 Страница урока",
                url: `${this.course.path}/lessons/${this.lesson.id}`
            }
        };
    }

    protected get html() {
        // Header
        const lines = [
            `<b>📖 Новый урок '${this.lesson.info.title}' опубликован</b>`
        ];
        if (this.lesson.info.description) {
            lines.push(`\n${this.lesson.info.description}`);
        }
        if (this.lesson.schedule) {
            // Date
            lines.push(
                "\n🕔 " +
                    this.lesson.schedule.date.toLocaleString("ru-RU", {
                        timeZone: "Europe/Moscow",
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        hourCycle: "h24",
                        minute: "2-digit"
                    })
            );
            // Location
            const postfix = this.lesson.schedule.location
                ? ` в ${this.lesson.schedule.location}`
                : "";
            if (this.lesson.schedule.isOnline && this.lesson.schedule.location)
                lines.push(`📍 Онлайн и офлайн` + postfix);
            else if (this.lesson.schedule.isOnline)
                lines.push(`📍 Онлайн` + postfix);
            else if (this.lesson.schedule.location)
                lines.push("📍 Офлайн" + postfix);
        }

        return lines.join("\n");
    }
}
