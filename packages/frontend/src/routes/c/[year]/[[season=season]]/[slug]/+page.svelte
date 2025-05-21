<script lang="ts">
    import LessonCard from "$lib/components/LessonCard.svelte";
    import { coursePath } from "$lib/path";
    import { format as formatDate } from "date-fns";
    import { courseFilePath } from "itam-edu-common";

    let { data } = $props();

    function displayChange(change: (typeof data.changes)[number]): Change {
        switch (change.payload.kind) {
            case "user-joined": {
                let title: string | null = null;
                if (change.payload.role === "staff") {
                    title =
                        change.payload.userId === data.user?.id
                            ? "Вы поступили на курс"
                            : "Студент зачислен на курс";
                } else {
                    title =
                        change.payload.userId === data.user?.id
                            ? "Вы стали сотрудником этого курса"
                            : "Сотрудник добавлен на курс";
                }
                return { icon: "hand-waving", title };
            }
            case "user-left": {
                let title: string | null = null;
                if (change.payload.userId === data.user?.id) {
                    title = "Вы покинули курс";
                } else if (change.payload.role === "staff") {
                    title = "Сотрудник покинул курс";
                } else {
                    title = "Студент покинул курс";
                }
                return { icon: "mask-sad", title };
            }
            case "lesson-created":
                return {
                    icon: "folder-plus",
                    title: "Урок создан",
                    href: `/lessons/${change.payload.lessonId}`
                };
            case "lesson-schedule-changed":
                return {
                    icon: "alarm",
                    title: "Урок перенесён",
                    href: `/lessons/${change.payload.lessonId}`
                };
            case "homework-created":
                return {
                    icon: "books",
                    title: "Задание создано",
                    href: `/homeworks/${change.payload.homeworkId}`
                };
            case "homework-deadline-changed":
                return {
                    icon: "alarm",
                    title: "Дедлайн задания изменён",
                    href: `/homeworks/${change.payload.homeworkId}`
                };
            case "submission-created": {
                let href = `/homeworks/${change.payload.homeworkId}`;
                if (data.user && change.payload.studentId !== data.user.id) {
                    href += `?student=${change.payload.studentId}`;
                }
                return { icon: "scroll", title: "Задание сдано", href };
            }
            case "submission-reviewed": {
                let href = `/homeworks/${change.payload.homeworkId}`;
                if (data.user && change.payload.studentId !== data.user.id) {
                    href += `?student=${change.payload.studentId}`;
                }
                return { icon: "exam", title: "Задание проверено", href };
            }
            default:
                let guard: never = change.payload;
                return {} as any;
        }
    }

    type Change = { icon: string; title: string; href?: string };
</script>

<svelte:head>
    <title>Главная | {data.course.title}</title>
</svelte:head>

<div class="w-min mx-auto flex flex-col gap-10 px-7 pb-10">
    <header class="flex flex-col">
        <div class="banner w-full aspect-[5] mb-7.5 rounded-lg overflow-hidden">
            {#if data.course.banner}
                <img
                    class={[
                        "w-full h-full object-cover object-center",
                        data.course.banner ? `` : ""
                    ]}
                    src={courseFilePath(data.course.id).public(
                        data.course.banner
                    )}
                    alt=""
                />
            {/if}
        </div>
        <h1>{data.course.title}</h1>
        {#if data.course.status}
            <h4 class="text-on-background-muted">{data.course.status}</h4>
        {/if}
    </header>
    <section class="flex flex-col gap-5 p-6 pb-8 bg-surface shadow rounded-xl">
        <header class="flex justify-between items-center">
            <h3>Уроки</h3>
            <a class="btn" href={`${coursePath(data.course)}/lessons`}>
                Все
                <i class="ph ph-arrow-right text-[26px]"></i>
            </a>
        </header>
        <ol
            class={[
                "flex flex-wrap gap-4",
                "h-[291px] overflow-y-hidden",
                "@max-[800px]/main:w-[356px]",
                "@min-[800px]/main:w-[calc(356px_*_2_+_16px)]",
                "@min-[1200px]/main:w-[calc(356px_*_3_+_16px_*_2)]",
                "@min-[1600px]/main:w-[calc(356px_*_4_+_16px_*_3)]"
            ]}
        >
            {#each data.lessons.toReversed().slice(0, 4) as lesson, i}
                <LessonCard
                    course={data.course}
                    {lesson}
                    position={data.lessons.length - i}
                />
            {:else}
                Пусто!
            {/each}
        </ol>
    </section>
    <section class="flex flex-col p-6 pb-8 bg-surface shadow rounded-xl">
        <header class="flex justify-between items-center h-11">
            <h3>Обновления по курсу</h3>
        </header>
        <hr class="text-primary-border mt-5" />
        <ol class="flex flex-col max-h-120 overflow-auto my-5 -m-6 -mb-8">
            {#each data.changes as change}
                {@const { icon, title, href } = displayChange(change)}
                <a
                    class="flex items-center gap-4 group px-6 py-4"
                    href={href ? coursePath(data.course) + href : null}
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
                    <header class="flex flex-col gap-1.5">
                        <p class="text-comment text-on-background">
                            {title}
                        </p>
                        <p class="text-base text-on-background-muted">...</p>
                    </header>
                    <p class="ml-auto text-on-surface-muted">
                        {formatDate(change.createdAt, "dd.MM.yy / HH:mm")}
                    </p>
                </a>
            {:else}
                Пусто!
            {/each}
        </ol>
    </section>
</div>

<style lang="scss">
    .banner {
        background: linear-gradient(
            -20deg,
            var(--color-primary),
            var(--color-on-primary)
        );
    }
</style>
