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
        "flex flex-col w-[356px] h-[291px] p-3 rounded-lg border",
        "bg-surface border-primary-border",
        "hover:bg-on-primary hover:border-primary",
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
                src={courseFilePath(lesson.courseId).public(lesson.banner)}
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
    <header class="flex justify-between items-center mb-2">
        <h4>Урок {position}</h4>
        {#if lesson.schedule}
            <span class="text-md-regular text-on-surface-muted">
                {formatDate(lesson.schedule.date, "dd.MM.yy")}
            </span>
        {/if}
    </header>
    <p class="text-md-regular text-on-surface-muted">{lesson.title}</p>
</a>
