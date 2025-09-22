<script lang="ts">
    import { coursePath } from "$lib/path";
    import type { CoursePartial } from "$lib/types";
    import { courseFilePath } from "itam-edu-common";

    const { course }: Props = $props();

    type Props = {
        course: CoursePartial;
    };
</script>

<a
    href={`${coursePath(course)}`}
    class={[
        "flex flex-col w-[317px] h-full rounded-lg",
        "bg-surface hover:bg-on-primary",
        "border border-surface-border hover:border-primary overflow-hidden",
        "transition-colors duration-100"
    ]}
    data-sveltekit-preload-data="off"
>
    <div class={["h-[225px] overflow-hidden", "text-on-primary bg-primary"]}>
        {#if course.cover}
            <img
                class="size-full object-cover object-top"
                src={courseFilePath(course.id, course.cover)}
                alt=""
            />
        {:else}
            <div
                class="size-full flex items-center justify-center text-h4 text-center"
            >
                {course.title}
            </div>
        {/if}
    </div>
    <div class="w-[315px] flex flex-col gap-1.5 pt-2.5 pb-4 px-3">
        <header class="mt-2.5 flex flex-col justify-between">
            <h4 class="text-on-surface">{course.title}</h4>
            <p class="text-sm-regular text-on-surface-muted">
                {#if course.semester === "autumn"}
                    Осень
                {:else if course.semester === "spring"}
                    Весна
                {/if}
                {course.year}
            </p>
        </header>
        <p class="text-md-regular text-on-surface line-clamp-3 text-ellipsis">
            {course.description}
        </p>
    </div>
</a>
