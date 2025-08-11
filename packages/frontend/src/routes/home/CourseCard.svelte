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
        `bg-surface border-primary-border`,
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
        {#if course.cover}
            <img
                class="size-full object-cover object-center"
                src={courseFilePath(course.id).public(course.cover)}
                alt=""
            />
        {:else}
            <div class="size-full flex items-center justify-center text-h4">
                {course.title}
            </div>
        {/if}
    </div>
    <header class="flex justify-between items-center mb-2.5">
        <h4>{course.title}</h4>
    </header>
    <p class="text-md-regular text-on-surface-muted line-clamp-3 text-ellipsis">
        {course.description}
    </p>
</a>
