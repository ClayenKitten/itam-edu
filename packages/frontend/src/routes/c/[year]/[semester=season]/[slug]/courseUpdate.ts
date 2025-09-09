import type { CourseChange, HomeworkPartial, LessonPartial } from "$lib/types";
import type { User } from "itam-edu-common";

/**
 * Map course changelog entry into representable format.
 *
 * `null` is only returned when something goes wrong on the backend and it
 * responds with something user should not be able to see.
 */
export function getCourseChangeDisplay(
    change: CourseChange,
    user: User | null,
    lessons: LessonPartial[],
    homeworks: HomeworkPartial[]
): CourseChangeDisplay | null {
    switch (change.payload.kind) {
        case "user-joined": {
            const icon = "hand-waving";
            if (!user) {
                return null;
            } else if (change.payload.userId === user.id) {
                return {
                    icon,
                    title:
                        change.payload.role === "staff"
                            ? "Вы стали сотрудником курса"
                            : "Вы поступили на курс",
                    message: "Добро пожаловать!"
                };
            } else if (change.payload.role === "staff") {
                // TODO: display tgUsername of the staff member
                return {
                    icon,
                    title: "Сотрудник добавлен на курс",
                    message: "Be nice!"
                };
            }
            return null;
        }
        case "user-left": {
            const icon = "mask-sad";
            if (!user) {
                return null;
            } else if (change.payload.userId === user.id) {
                return {
                    icon,
                    title: "Вы покинули этот курс",
                    message: "Будем скучать!"
                };
            } else if (change.payload.role === "staff") {
                // TODO: display tgUsername of the staff member
                return {
                    icon,
                    title: "Сотрудник покинул курс",
                    message: "Будем скучать!"
                };
            }
            return null;
        }
        case "course-created": {
            return {
                icon: "building-apartment",
                title: "Курс создан",
                message: "Здесь начинается история"
            };
        }
        case "lesson-created": {
            const lsnTitle = lessonTitle(change.payload.lessonId);
            return {
                icon: "folder-plus",
                title: "Новый урок",
                message: `Опубликован новый урок '${lsnTitle}'.`,
                href: `/lessons/${change.payload.lessonId}`
            };
        }
        case "lesson-schedule-changed": {
            const lsnTitle = lessonTitle(change.payload.lessonId);
            return {
                icon: "alarm",
                title: "Урок перенесён",
                message: `Урок '${lsnTitle}' перенесён.`,
                href: `/lessons/${change.payload.lessonId}`
            };
        }
        case "homework-created": {
            const hwTitle = homeworkTitle(change.payload.homeworkId);
            return {
                icon: "books",
                title: "Новое задание",
                message: `Опубликовано новое задание '${hwTitle}'`,
                href: `/homeworks/${change.payload.homeworkId}`
            };
        }
        case "homework-deadline-changed": {
            const hwTitle = homeworkTitle(change.payload.homeworkId);
            return {
                icon: "alarm",
                title: "Дедлайн задания изменён",
                message: `Дедлайн задания '${hwTitle}' изменён`,
                href: `/homeworks/${change.payload.homeworkId}`
            };
        }
        case "submission-created": {
            const icon = "scroll";
            const hwTitle = homeworkTitle(change.payload.homeworkId);
            if (user && change.payload.studentId === user.id) {
                return {
                    icon,
                    title: "Задание отправлено",
                    message: `Вы отправили ответ на задание '${hwTitle}'.`,
                    href: `/homeworks/${change.payload.homeworkId}`
                };
            }
            return null;
        }
        case "submission-reviewed": {
            const icon = "exam";
            const href = `/homeworks/${change.payload.homeworkId}`;
            const hwTitle = homeworkTitle(change.payload.homeworkId);
            if (user && change.payload.studentId === user.id) {
                if (change.payload.accepted) {
                    return {
                        icon,
                        title: `Задание принято`,
                        message: `Вы успешно сдали задание '${hwTitle}'.`,
                        href
                    };
                } else {
                    return {
                        icon,
                        title: `Задание отклонено`,
                        message: `Ответ на задание '${hwTitle}' нужно доработать.`,
                        href
                    };
                }
            }
            return null;
        }
        default:
            let guard: never = change.payload;
            console.error(
                `Unknown changelog entry type: ${(change.payload as any).kind}`
            );
            return null;
    }

    function lessonTitle(id: string) {
        return lessons.find(l => l.id === id)?.title ?? "[удалено]";
    }
    function homeworkTitle(id: string) {
        return homeworks.find(h => h.id === id)?.title ?? "[удалено]";
    }
}
type CourseChangeDisplay = {
    icon: string;
    title: string;
    message: string | null;
    href?: string;
};
