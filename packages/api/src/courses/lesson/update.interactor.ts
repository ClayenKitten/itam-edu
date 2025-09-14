import { injectable } from "inversify";
import { NotFoundError, UnauthorizedError } from "../../api/errors";
import { NotificationSender } from "../../notifications/sender";
import type { User } from "itam-edu-common";
import { Lesson } from "./entity";
import { LessonRepository } from "./repository";
import * as schema from "./schema";
import { CourseChangelog } from "../changes";
import { CourseRepository } from "../repository";
import { NotificationTemplate } from "../../notifications";
import type { Course } from "../entity";

@injectable()
export class UpdateLesson {
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
        lessonId: string,
        change: typeof schema.updateLesson.static
    ): Promise<Lesson | UnauthorizedError> {
        const course = await this.courseRepo.getById(courseId);
        const permissions = course?.getPermissionsFor(actor);
        if (!course || !permissions) {
            return new NotFoundError("Course does not exist.");
        }
        if (permissions.lessons.edit !== true) {
            return new UnauthorizedError(
                "You are not allowed to edit lessons."
            );
        }

        const lesson = await this.repo.load(courseId, lessonId);
        if (!lesson) return new UnauthorizedError("Lesson not found.");

        const newLesson = new Lesson(
            lesson.id,
            lesson.courseId,
            {
                ...lesson.info,
                ...change.info
            },
            change.content === undefined ? lesson.content : change.content,
            change.homeworks === undefined
                ? lesson.homeworks
                : change.homeworks,
            change.schedule === undefined ? lesson.schedule : change.schedule
        );
        await this.repo.save(newLesson);

        if (change.schedule !== undefined) {
            if (newLesson.schedule !== null) {
                await this.notificationSender.send(
                    new Notification(course, newLesson),
                    [...course.members.map(m => m.id)]
                );
                await this.changelog.add(actor, course, {
                    kind: "lesson-schedule-changed",
                    lessonId: lesson.id
                });
            }
        }

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
            title: `Урок '${this.lesson.info.title}' перенесён.`,
            icon: "alarm",
            url: `${this.course.path}/lessons/${this.lesson.id}`
        };
    }

    public toTelegram(id: string, _userId: string) {
        return {
            id,
            html: this.html,
            link: {
                text: "🔗 Страница урока",
                url: `${this.course.path}/lessons/${this.lesson.id}`
            }
        };
    }

    protected get html() {
        if (!this.lesson.schedule) throw new Error("schedule must be present");
        // Header
        let lines = [`<b>📅 Урок '${this.lesson.info.title}' перенесён</b>.\n`];
        if (this.lesson.info.description)
            lines.push(`${this.lesson.info.description}\n`);
        // Date
        lines.push(
            "🕔 " +
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
        let postfix = this.lesson.schedule.offline?.location
            ? ` в ${this.lesson.schedule.offline.location}`
            : "";
        if (this.lesson.schedule.online && this.lesson.schedule.offline)
            lines.push(`📍 Онлайн и офлайн` + postfix);
        else if (this.lesson.schedule.online) lines.push(`📍 Онлайн` + postfix);
        else if (this.lesson.schedule.offline)
            lines.push("📍 Офлайн" + postfix);

        return lines.join("\n");
    }
}
