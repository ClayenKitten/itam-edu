<script lang="ts">
    import type { CourseChange } from "$lib/types";
    import { format as formatDate } from "date-fns";
    import type { PageData } from "./$types";
    import { coursePath } from "$lib/path";

    let { change, data }: Props = $props();
    const { icon, title, message, href } = $derived(displayChange(change));

    type Props = {
        change: CourseChange;
        data: PageData;
    };

    function displayChange(change: CourseChange): ChangeDisplay {
        // TODO: display name of the actor or target should be displayed in the message too, but there is currently no way to do that
        switch (change.payload.kind) {
            case "user-joined": {
                let title: string | null = null;
                let message: string | null = null;
                if (change.payload.userId === data.user?.id) {
                    title =
                        change.payload.role === "staff"
                            ? "Вы стали сотрудником этого курса"
                            : "Вы поступили на этот курс";
                    message = "Добро пожаловать!";
                } else {
                    title =
                        change.payload.role === "staff"
                            ? "Сотрудник добавлен на курс"
                            : "Студент зачислен на курс";
                }
                return { icon: "hand-waving", title, message };
            }
            case "user-left": {
                let title: string | null = null;
                let message: string | null = null;
                if (change.payload.userId === data.user?.id) {
                    title = "Вы покинули этот курс";
                    message = "Будем скучать!";
                } else if (change.payload.role === "staff") {
                    title = "Сотрудник покинул курс";
                } else {
                    title = "Студент покинул курс";
                }
                return { icon: "mask-sad", title, message };
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
                if (change.payload.studentId === data.user?.id) {
                    return {
                        icon,
                        title: "Задание отправлено",
                        message: `Вы отправили ответ на задание '${hwTitle}'.`,
                        href: `/homeworks/${change.payload.homeworkId}`
                    };
                } else {
                    return {
                        icon,
                        title: "Новый ответ на задание",
                        message: `На задание '${hwTitle}' поступил ответ от студента.`,
                        href: `/homeworks/${change.payload.homeworkId}/review/${change.payload.studentId}`
                    };
                }
            }
            case "submission-reviewed": {
                const icon = "exam";
                const href = `/homeworks/${change.payload.homeworkId}`;
                const hwTitle = homeworkTitle(change.payload.homeworkId);
                if (change.payload.studentId === data.user?.id) {
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
                } else {
                    return {
                        icon,
                        title: "Задание проверено",
                        message: `Ответ на задание '${hwTitle}' ${change.payload.accepted ? "принят" : "отклонён"}.`,
                        href: href + `/review/${change.payload.studentId}`
                    };
                }
            }
            default:
                let guard: never = change.payload;
                console.error(
                    `Unknown changelog entry type: ${(change.payload as any).kind}`
                );
                return {
                    icon: "question-mark",
                    title: "Как это здесь оказалось?",
                    message: "Неизвестный тип изменения."
                };
        }

        function lessonTitle(id: string) {
            return data.lessons.find(l => l.id === id)?.title ?? "[удалено]";
        }
        function homeworkTitle(id: string) {
            return data.homeworks.find(h => h.id === id)?.title ?? "[удалено]";
        }
    }
    type ChangeDisplay = {
        icon: string;
        title: string;
        message: string | null;
        href?: string;
    };
</script>

<a
    class="flex items-center gap-4 group px-6 py-4"
    href={href ? coursePath(data.course) + href : null}
    data-sveltekit-preload-data="off"
>
    <i
        class={[
            `ph ph-${icon}`,
            "flex justify-center items-center w-14.5 h-14.5",
            "text-[24px] text-primary bg-on-primary rounded-sm",
            "border border-primary-border group-hover:border-primary",
            "transition-colors duration-100"
        ]}
    ></i>
    <header class="flex flex-col">
        <p class="text-lg-medium text-on-background">{title}</p>
        <p class="text-md-regular text-on-background-muted">{message}</p>
    </header>
    <p class="ml-auto text-on-surface-muted">
        {formatDate(change.createdAt, "dd.MM.yy / HH:mm")}
    </p>
</a>
