<script lang="ts">
    import { formatLessonSchedule } from "$lib/format";
    import { coursePath, filePath } from "$lib/path";
    import type { Course, LessonPartial } from "$lib/types";
    import { format as formatDate } from "date-fns";
    import { ru } from "date-fns/locale";

    const { course, position, lesson }: Props = $props();

    type Props = {
        course: Course;
        position: number;
        lesson: LessonPartial;
    };
</script>

<a
    href={`${coursePath(course)}/lessons/${lesson.id}`}
    class={[
        "flex flex-col w-[356px] h-[295px] p-3 pb-4 rounded-lg border",
        "bg-surface hover:bg-on-primary",
        "border-surface-border hover:border-primary",
        "transition-colors duration-100"
    ]}
>
    <div
        class="w-full h-[200px] mb-3 rounded-md overflow-hidden"
        aria-hidden="true"
    >
        {#if lesson.banner}
            <img
                class="w-full h-full overflow-hidden object-cover"
                src={filePath(lesson.banner)}
                alt=""
            />
        {:else}
            <div
                class="w-full h-full flex items-center justify-center text-h3 text-on-primary bg-primary"
            >
                Урок {position}
            </div>
        {/if}
    </div>
    <header class="flex justify-between items-center mb-2 px-1">
        <h4>Урок {position}</h4>
        {#if lesson.schedule}
            <span
                class="text-md-regular text-on-surface-muted"
                title={formatLessonSchedule(lesson.schedule)}
            >
                {formatDate(lesson.schedule.date, "d MMMM в HH:mm", {
                    locale: ru
                })}
            </span>
        {/if}
    </header>
    <p class="text-md-regular text-on-surface-muted px-1">{lesson.title}</p>
</a>
