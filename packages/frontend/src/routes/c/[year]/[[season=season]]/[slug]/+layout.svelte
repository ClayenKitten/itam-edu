<script lang="ts">
    import CourseSidebar from "./CourseSidebar.svelte";

    let { data, children } = $props();
</script>

<div
    id="wrapper"
    class="grid grid-cols-[278px_1fr] grid-rows-[60px_1fr] min-h-dvh bg-background"
>
    <CourseSidebar
        isEmployee={data.permissions?.course.some(
            x => x.courseId === data.course.id
        ) ?? false}
    />
    <header class="flex justify-end px-7 py-1.25 gap-3">
        <button
            class="h-full aspect-square bg-on-primary rounded-xs"
            aria-label="Уведомления"
        >
            <i class="ph ph-bell text-primary text-[20px]"></i>
        </button>
        <a
            href="/calendar"
            class="flex justify-center items-center h-full aspect-square bg-on-primary rounded-xs"
            aria-label="Календарь"
        >
            <i class="ph ph-calendar-dots text-primary text-[20px]"></i>
        </a>
        <a
            href="/profile"
            class="flex justify-center items-center h-full aspect-square bg-primary rounded-xs"
            aria-label="Профиль"
        ></a>
    </header>
    <main class="flex flex-col items-stretch">
        {@render children()}
    </main>
</div>
