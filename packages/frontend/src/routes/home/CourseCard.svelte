<script lang="ts">
    import { coursePath } from "$lib/path";
    import type { Course, CoursePartial } from "$lib/types";
    import { courseFilePath } from "itam-edu-common";

    const { course }: Props = $props();

    type Props = {
        course: CoursePartial;
    };
</script>

<a
    href={`${coursePath(course)}`}
    class={[
        "flex flex-col w-[317px] h-full p-3 pb-3.75 rounded-lg border",
        `bg-surface border-on-primary`,
        `hover:bg-on-primary hover:border-primary`,
        "transition-colors duration-100"
    ]}
>
    <div
        class={[
            "h-[223px] w-[293px] mb-3 rounded-md overflow-hidden",
            "text-on-primary bg-primary"
        ]}
    >
        {#if course.banner}
            <img
                class="h-full w-full object-cover object-center"
                src={courseFilePath(course.id).public(course.banner)}
                alt=""
            />
        {:else}
            <div class="h-full w-full flex items-center justify-center text-h4">
                {course.title}
            </div>
        {/if}
    </div>
    <header class="flex justify-between items-center mb-2.5">
        <h4 class="text-comment">{course.title}</h4>
    </header>
    <p class="text-base text-on-surface-muted line-clamp-3 text-ellipsis">
        {course.description}
    </p>
</a>
