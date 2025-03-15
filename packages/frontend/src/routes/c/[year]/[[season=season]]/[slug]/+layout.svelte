<script lang="ts">
    import CourseSidebar from "./CourseSidebar.svelte";

    let { data, children } = $props();
</script>

<div
    id="wrapper"
    class="grid grid-cols-[278px_1fr] grid-rows-[56px_1fr] min-h-dvh bg-background"
    style:--color-primary={data.course.colorPrimary}
    style:--color-on-primary={data.course.colorOnPrimary}
>
    <CourseSidebar
        isEmployee={data.permissions?.course.some(
            x => x.courseId === data.course.id
        ) ?? false}
    />
    <header class="flex justify-end px-7 py-2 gap-2.5">
        <button
            class="flex justify-center items-center h-full aspect-square hover:bg-on-primary rounded-xs"
            aria-label="Уведомления"
        >
            <i class="ph ph-bell text-primary text-[20px]"></i>
        </button>
        <button
            class="flex justify-center items-center h-full aspect-square hover:bg-on-primary rounded-xs"
            aria-label="Календарь"
        >
            <i class="ph ph-calendar-dots text-primary text-[20px]"></i>
        </button>
        {#if data.user}
            <a
                href="/profile"
                class="flex justify-center items-center h-full aspect-square ml-2.5 bg-primary rounded-xs"
                aria-label="Профиль"
            ></a>
        {:else}
            <button class="btn h-full ml-2.5">Войти</button>
        {/if}
    </header>
    <main class="flex flex-col items-stretch">
        {@render children()}
    </main>
</div>
