import { NotFoundError, UnauthorizedError } from "../../api/errors";
import type { AppConfig } from "../../config";
import type NotificationService from "../../notifications/service";
import type StaffRepository from "../../staff/repository";
import type { User } from "itam-edu-common";
import type { Course } from "../entity";
import type StudentRepository from "../student/repository";
import { Lesson } from "./entity";
import type LessonRepository from "./repository";
import * as schema from "./schema";
import { randomUUID } from "crypto";

export class LessonService {
    public constructor(
        private config: AppConfig,
        private db: {
            lesson: LessonRepository;
            staff: StaffRepository;
            student: StudentRepository;
        },
        private notification: NotificationService
    ) {}

    /** Creates new lesson. */
    public async create(
        actor: User,
        course: Course,
        data: typeof schema.createLesson.static
    ): Promise<Lesson | UnauthorizedError> {
        if (!actor.hasCoursePermission(course.id, "canEditContent")) {
            return new UnauthorizedError();
        }

        const newLesson = new Lesson(
            randomUUID(),
            course.id,
            data.info,
            data.content,
            data.homeworks,
            data.schedule
        );
        await this.db.lesson.set(newLesson);
        return newLesson;
    }

    /** Updates existing lesson. */
    public async update(
        actor: User,
        course: Course,
        lesson: Lesson,
        change: typeof schema.updateLesson.static
    ): Promise<Lesson | UnauthorizedError> {
        if (!actor.hasCoursePermission(course.id, "canEditContent")) {
            return new UnauthorizedError();
        }

        const newLesson = new Lesson(
            lesson.id,
            lesson.courseId,
            {
                ...lesson.info,
                ...change.info
            },
            change.content ?? lesson.content,
            change.homeworks ?? lesson.homeworks,
            change.schedule ?? lesson.schedule
        );
        await this.db.lesson.set(newLesson);

        if (change.schedule !== undefined) {
            const students = await this.db.student.getAll(course);
            const staff = await this.db.staff.getAll(course);

            if (newLesson.schedule !== null) {
                const text = this.getRescheduleNotificationText(
                    course,
                    newLesson
                );
                await this.notification.send(
                    text,
                    Array.from(
                        new Set([...students, ...staff.map(s => s.userId)])
                    )
                );
            }
        }

        return newLesson;
    }

    /** Updates lesson list. */
    public async updateAll(
        actor: User,
        course: Course,
        update: typeof schema.updateLessonsList.static
    ): Promise<void | UnauthorizedError> {
        if (!actor.hasCoursePermission(course.id, "canEditContent")) {
            return new UnauthorizedError();
        }
        await this.db.lesson.updateAll(course, update);
    }

    private getRescheduleNotificationText(
        course: Course,
        lesson: Lesson
    ): string {
        if (!lesson.schedule) throw new Error("schedule must be present");
        // Header
        let lines = [`<b>📅 Урок '${lesson.info.title}' перенесён</b>.\n`];
        if (lesson.info.description) lines.push(`${lesson.info.description}\n`);
        // Date
        lines.push(
            "🕔 " +
                lesson.schedule.date.toLocaleString("ru-RU", {
                    timeZone: "Europe/Moscow",
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    hourCycle: "h24",
                    minute: "2-digit"
                })
        );
        // Location
        let postfix = lesson.schedule.offline?.location
            ? ` в ${lesson.schedule.offline.location}`
            : "";
        if (lesson.schedule.online && lesson.schedule.offline)
            lines.push(`📍 Онлайн и офлайн` + postfix);
        else if (lesson.schedule.online) lines.push(`📍 Онлайн` + postfix);
        else if (lesson.schedule.offline) lines.push("📍 Офлайн" + postfix);
        // Link
        lines.push(
            `\n<a href="${this.config.webUrl}${course.path}/lessons/${lesson.id}">🔗 Страница урока</a>`
        );

        return lines.join("\n");
    }
}
