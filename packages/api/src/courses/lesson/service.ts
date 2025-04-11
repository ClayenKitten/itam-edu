import { NotFoundError, UnauthorizedError } from "../../api/errors";
import type { AppConfig } from "../../config";
import type NotificationService from "../../notifications/service";
import type StaffRepository from "../../staff/repository";
import type { User } from "../../users/entity";
import type { Course } from "../entity";
import type StudentRepository from "../student/repository";
import type { Lesson } from "./entity";
import type LessonRepository from "./repository";
import * as schema from "./schema";

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

    public async update(
        actor: User,
        course: Course,
        lesson: Lesson,
        change: typeof schema.updateLesson.static
    ): Promise<Lesson | UnauthorizedError | NotFoundError> {
        if (!actor.permissions.course(course.id)?.canEditContent) {
            return new UnauthorizedError();
        }

        const newLesson = await this.db.lesson.update(lesson, change);
        if (!newLesson) return new NotFoundError();

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
                        new Set([
                            ...students.map(s => s.userId),
                            ...staff.map(s => s.userId)
                        ])
                    )
                );
            }
        }

        return newLesson;
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
