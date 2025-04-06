<script lang="ts">
    import { coursePath } from "$lib/path";
    import type { Course, Lesson } from "$lib/types";
    import { format as formatDate } from "date-fns";

    let { course, lesson = $bindable() }: Props = $props();

    type Props = {
        course: Course;
        lesson: Lesson;
    };

    const remove = (id: string) => {
        lesson.homeworks = lesson.homeworks.filter(h => h.id !== id);
    };
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <header class="flex flex-col gap-2">
        <h3>Домашние задания</h3>
        <p class="max-w-[800px] text-balance">
            К занятию могут быть прикреплены домашние задания. Одно и то же
            задание может быть прикреплено к нескольким занятиям.
        </p>
    </header>
    {#if lesson.homeworks}
        <ul class="flex flex-col gap-5 w-full">
            {#each lesson.homeworks as homework}
                <li class="flex items-center w-full gap-1 group">
                    <div class="flex items-center justify-center w-7.5 h-7.5">
                        <i class="ph ph-dots-six-vertical text-[19px]"></i>
                    </div>
                    <div
                        class={[
                            "flex grow items-center justify-between px-5 py-4",
                            "bg-surface group-hover:bg-on-primary",
                            "border border-on-primary group-hover:border-primary",
                            "transition-colors duration-100 rounded-sm"
                        ]}
                    >
                        <div class="flex flex-col gap-1.75">
                            <span class="text-comment">{homework.title}</span>
                            <span class="text-date">
                                {#if homework.deadline}
                                    До {formatDate(
                                        homework.deadline,
                                        "dd.mm.yy HH:mm"
                                    )}
                                {:else}
                                    Без дедлайна
                                {/if}
                            </span>
                        </div>
                        <menu
                            class="flex gap-4 text-on-surface-muted group-hover:text-on-surface"
                        >
                            <a
                                class="flex justify-center items-center w-6 h-6"
                                aria-label="Открыть"
                                href={`${coursePath(course)}/homeworks/${homework.id}`}
                                target="_blank"
                            >
                                <i class="ph ph-arrow-square-out text-[18px]"
                                ></i>
                            </a>
                            <button
                                class="flex justify-center items-center w-6 h-6"
                                aria-label="Удалить"
                                onclick={() => remove(homework.id)}
                            >
                                <i class="ph ph-trash text-[18px]"></i>
                            </button>
                        </menu>
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
    <button class="btn w-min">
        Добавить
        <i class="ph ph-plus text-[18px]"></i>
    </button>
</section>
