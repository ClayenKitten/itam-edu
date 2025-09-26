<script lang="ts">
    import { coursePath } from "$lib/path";
    import type { Course, Lesson } from "$lib/types";
    import { format as formatDate } from "date-fns";
    import HomeworkAttachmentWindow from "./HomeworkAttachmentWindow.svelte";

    let { course, homeworkIds = $bindable() }: Props = $props();

    type Props = {
        course: Course;
        homeworkIds: string[];
    };

    let homeworkAttachmentWindow: HomeworkAttachmentWindow;

    const canAdd = $derived(homeworkIds.length !== course.homeworks.length);
</script>

<HomeworkAttachmentWindow
    bind:this={homeworkAttachmentWindow}
    {course}
    addedHomeworks={homeworkIds}
    onHomeworkAdded={id => homeworkIds.push(id)}
/>

<section class="flex flex-col gap-4 p-7.5 rounded-xl bg-surface shadow">
    <header class="flex flex-col gap-2">
        <h3>Задания</h3>
        <p class="max-w-[800px] text-balance">
            К уроку могут быть прикреплены задания для выполнения студентами.
            Одно и то же задание может быть прикреплено к нескольким урокам.
        </p>
    </header>
    {#if homeworkIds.length > 0}
        <ol class="flex flex-col gap-2 w-full">
            {#each homeworkIds as homeworkId (homeworkId)}
                {@const homework = course.homeworks.find(
                    h => h.id === homeworkId
                )!}
                <li
                    class={[
                        "flex grow items-center justify-between px-5 py-4",
                        "bg-surface border border-surface-border rounded-sm shadow"
                    ]}
                >
                    <div class="flex flex-col gap-1.75">
                        <span class="text-xl-medium text-on-surface">
                            {homework.title}
                        </span>
                        <span class="text-sm-regular text-on-surface-muted">
                            {homework.deadline
                                ? `До ${formatDate(homework.deadline, "dd.MM.yy HH:mm")}`
                                : "Без дедлайна"}
                        </span>
                    </div>
                    <menu
                        class="flex gap-4 text-on-surface-muted group-hover:text-on-surface"
                    >
                        <a
                            class={[
                                "flex justify-center items-center w-9 h-9 border",
                                "text-primary bg-on-primary border-primary-border rounded-2xs",
                                "hover:text-on-primary hover:bg-primary hover:border-primary",
                                "transition-colors duration-200"
                            ]}
                            aria-label="Открыть"
                            href={`${coursePath(course)}/homeworks/${homework.id}`}
                            target="_blank"
                        >
                            <i class="ph ph-arrow-square-out text-[18px]"></i>
                        </a>
                        <button
                            class={[
                                "flex justify-center items-center w-9 h-9 border",
                                "text-primary bg-on-primary border-primary-border rounded-2xs",
                                "hover:text-on-primary hover:bg-primary hover:border-primary",
                                "transition-colors duration-200"
                            ]}
                            aria-label="Удалить"
                            onclick={() => {
                                homeworkIds = homeworkIds.filter(
                                    id => id !== homeworkId
                                );
                            }}
                        >
                            <i class="ph ph-trash text-[20px]"></i>
                        </button>
                    </menu>
                </li>
            {/each}
        </ol>
    {/if}
    <button
        class={["btn w-min", !canAdd && "cursor-not-allowed"]}
        onclick={() => homeworkAttachmentWindow.show()}
        title={canAdd
            ? null
            : course.homeworks.length === 0
              ? "На курс ещё не добавлено ни одного задания"
              : "Вы прикрепили все задания курса к этому уроку"}
        disabled={!canAdd}
    >
        <i class="ph ph-stack-plus text-[18px]"></i>
        Прикрепить
    </button>
</section>
