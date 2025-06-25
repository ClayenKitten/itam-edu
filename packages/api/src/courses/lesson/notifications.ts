import { Notification, type NotificationLink } from "../../notifications";
import type { Course } from "../entity";
import type { Lesson } from "./entity";

export class LessonRescheduleNotification extends Notification {
    public constructor(
        protected course: Course,
        protected lesson: Lesson
    ) {
        super();
    }

    public get audience() {
        return [...this.course.staffIds, ...this.course.studentIds];
    }

    public get html() {
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

    public get icon() {
        return "reshceduled_icon";
    }

    public get title() {
        return `Урок '${this.lesson.info.title}' перенесён.`;
    }

    public get courseId() {
        return `${this.lesson.courseId}`;
    }

    public override get link(): NotificationLink {
        return {
            text: "🔗 Страница урока",
            url: `${this.course.path}/lessons/${this.lesson.id}`
        };
    }
}
