<script lang="ts">
    import { goto, invalidate } from "$app/navigation";
    import { page } from "$app/state";
    import { coursePath } from "$lib/path";
    import type { Course } from "$lib/types";

    const { course, courses, isEmployee }: Props = $props();
    const prefix = $derived(coursePath(course));

    type Props = {
        course: Course;
        courses: Course[];
        isEmployee: boolean;
    };
</script>

{#snippet btn(path: string, text: string, icon: string)}
    {@const startsWith = page.url.pathname.startsWith(prefix + path)}
    {@const enabled =
        (path === "/" && page.url.pathname === prefix) ||
        (path !== "/" && startsWith)}
    <a
        href={prefix + path}
        class={[
            "flex items-center gap-3 text-button p-2.5 rounded-xs",
            enabled
                ? "text-on-primary bg-primary"
                : "text-on-surface bg-transparent hover:bg-surface-tint"
        ]}
        data-sveltekit-preload-data="off"
    >
        <i class="ph ph-{icon} text-[24px]"></i>
        <span>{text}</span>
    </a>
{/snippet}

<nav
    class={[
        "sticky top-0 h-dvh row-span-2 flex flex-col gap-6 p-5",
        "bg-surface border-r border-surface-border"
    ]}
>
    <header
        class="flex items-center w-full h-13 text-button bg-surface-tint rounded-xs px-4"
    >
        <select
            class="w-full h-full"
            bind:value={() => courses.find(c => c.id === course.id)!,
            async newCourse => {
                await goto(coursePath(newCourse));
            }}
        >
            {#each courses as courseItem}
                <option
                    value={courseItem}
                    selected={course.id === courseItem.id}
                >
                    {courseItem.title}
                </option>
            {/each}
        </select>
    </header>
    <ul class="flex flex-col gap-2">
        {@render btn("/", "Главная", "house")}
        {@render btn("/lessons", "Уроки", "folder")}
        {@render btn("/homeworks", "Задания", "book-open-text")}
        {@render btn("/about", "О курсе", "info")}
    </ul>
    {#if isEmployee}
        <hr class="text-surface-border -mx-5" />
        <ul class="flex flex-col gap-2">
            {@render btn("/analytics", "Аналитика", "chart-line")}
            {@render btn("/settings", "Настройки", "gear-six")}
        </ul>
    {/if}
</nav>
