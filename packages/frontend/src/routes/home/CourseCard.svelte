<script lang="ts">
    import { coursePath } from "$lib/path";
    import type { Course, LessonPartial } from "$lib/types";

    const { course }: Props = $props();

    type Props = {
        course: Course;
    };
</script>

<a
    href={`${coursePath(course)}`}
    class={[
        "flex flex-col w-[343px] h-[291px] p-3 pb-3.75 rounded-lg border",
        `bg-surface border-on-primary`,
        `hover:bg-on-primary hover:border-primary`,
        "transition-colors duration-100"
    ]}
>
    {#if course.banner}
        <img
            class="h-[202px] w-full rounded-md mb-3.5 overflow-hidden object-cover"
            src={course.banner}
            alt=""
        />
    {:else}
        <div
            class="h-[202px] w-full flex items-center justify-center text-h3 text-on-primary bg-primary rounded-md mb-3.5"
        >
            {course.title}
        </div>
    {/if}
    <header class="flex justify-between items-center mb-2.5">
        <h4 class="text-comment">{course.title}</h4>
    </header>
    <p class="text-base text-on-surface-muted">{course.description}</p>
</a>
