import type { User } from "itam-edu-common";
import {
    NotificationTemplate,
    type TelegramNotification,
    type WebNotification
} from "../../notifications";
import type Homework from "../homework/entity";
import type { Course } from "../entity";

export class SubmissionNotificationTemplate extends NotificationTemplate {
    public constructor(
        protected course: Course,
        protected homework: Homework,
        protected student: User
    ) {
        super();
    }

    public override toWeb(id: string, _userId: string): WebNotification {
        return {
            id,
            courseId: this.course.id,
            title: `Новый ответ на задание '${this.homework.title}'.`,
            icon: "scroll"
        };
    }

    public override toTelegram(
        id: string,
        _userId: string
    ): TelegramNotification {
        return {
            id,
            html: [
                "<b>📝 Новый ответ на задание</b>",
                `Студент @${this.student.telegram.username} сдал(а) задание '${this.homework.title}'.`
            ].join("\n\n"),
            link: {
                text: "🔗 Проверить",
                url: `${this.course.path}/homeworks/${this.homework.id}?student=${this.student.id}`
            }
        };
    }
}

export class SubmissionReviewNotificationTemplate extends NotificationTemplate {
    public constructor(
        protected course: Course,
        protected homework: Homework,
        protected student: User,
        protected accepted: boolean
    ) {
        super();
    }

    public override toWeb(id: string, _userId: string): WebNotification {
        return {
            id,
            courseId: this.course.id,
            title: this.title,
            icon: "exam"
        };
    }

    public override toTelegram(
        id: string,
        _userId: string
    ): TelegramNotification {
        return {
            id,
            html: this.html,
            link: {
                text: "🔗 Посмотреть",
                url: `${this.course.path}/homeworks/${this.homework.id}`
            }
        };
    }

    protected get title() {
        if (this.accepted) {
            return `Задание '${this.homework.title}' сдано.`;
        } else {
            return `Задание '${this.homework.title}' нужно переделать.`;
        }
    }

    protected get html() {
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
}
