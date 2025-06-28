import type { User } from "itam-edu-common";
import { Notification, type NotificationLink } from "../../notifications";
import type Homework from "../homework/entity";
import type { Course } from "../entity";

export class SubmissionNotification extends Notification {
    public constructor(
        protected course: Course,
        protected homework: Homework,
        protected student: User
    ) {
        super();
    }

    public get audience() {
        return this.course.staffIds;
    }

    public get html() {
        return [
            "<b>📝 Новый ответ на задание</b>",
            `Студент @${this.student.telegram.username} сдал(а) задание '${this.homework.title}'.`
        ].join("\n\n");
    }

    public get icon() {
        return "scroll";
    }

    public get title() {
        return `Новый ответ на задание '${this.homework.title}'.`;
    }

    public get courseId() {
        return `${this.homework.course}`;
    }

    public override get link(): NotificationLink {
        return {
            text: "🔗 Проверить",
            url: `${this.course.path}/homeworks/${this.homework.id}?student=${this.student.id}`
        };
    }
}

export class SubmissionReviewNotification extends Notification {
    public constructor(
        protected course: Course,
        protected homework: Homework,
        protected student: User,
        protected accepted: boolean
    ) {
        super();
    }

    public get audience() {
        return [this.student.id];
    }

    public get html() {
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

    public get icon() {
        return "exam";
    }

    public get title() {
        if (this.accepted) {
            return `Задание '${this.homework.title}' сдано.`;
        } else {
            return `Задание '${this.homework.title}' нужно переделать.`;
        }
    }

    public get courseId() {
        return `${this.homework.course}`;
    }

    public override get link(): NotificationLink {
        return {
            text: "🔗 Посмотреть",
            url: `${this.course.path}/homeworks/${this.homework.id}`
        };
    }
}
