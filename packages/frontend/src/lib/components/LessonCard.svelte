<script lang="ts">
    import { coursePath } from "$lib/path";
    import type { Course, LessonPartial } from "$lib/types";
    import { format as formatDate } from "date-fns";
    import { courseFilePath } from "itam-edu-common";

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
        "flex flex-col w-[343px] h-[291px] p-3 pb-3.75 rounded-lg border",
        "bg-surface border-on-primary",
        "hover:bg-on-primary hover:border-primary",
        "transition-colors duration-100"
    ]}
>
    {#if lesson.banner}
        <img
            class="grow w-full rounded-md mb-3.5 overflow-hidden object-cover"
            src={courseFilePath(lesson.courseId).public(lesson.banner)}
            alt=""
        />
    {:else}
        <div
            class="grow w-full flex items-center justify-center text-h3 text-on-primary bg-primary rounded-md mb-3.5"
        >
            Урок {position}
        </div>
    {/if}
    <header class="flex justify-between items-center mb-2.5">
        <h4>Урок {position}</h4>
        {#if lesson.schedule}
            <span class="text-date text-on-surface-muted">
                {formatDate(lesson.schedule.date, "dd.MM.yy")}
            </span>
        {/if}
    </header>
    <p class="text-base text-on-surface-muted">{lesson.title}</p>
</a>
