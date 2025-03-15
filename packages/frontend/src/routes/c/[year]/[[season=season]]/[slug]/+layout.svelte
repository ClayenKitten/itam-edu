<script lang="ts">
    import { MyWindow } from "$lib/windows";
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
        {#if data.user}
            <button
                class="flex justify-center items-center h-full aspect-square hover:bg-on-primary rounded-xs"
                aria-label="Уведомления"
            >
                <i class="ph ph-bell text-primary text-[20px]"></i>
            </button>
            <button
                class="flex justify-center items-center h-full aspect-square hover:bg-on-primary rounded-xs"
                aria-label="Календарь"
                onclick={() => new MyWindow("calendar").open()}
            >
                <i class="ph ph-calendar-dots text-primary text-[20px]"></i>
            </button>
            <a
                href="/profile"
                class="flex justify-center items-center h-full aspect-square ml-2.5 bg-primary rounded-xs"
                aria-label="Профиль"
            >
                {#if data.user.avatar}{:else}
                    <span class="text-on-primary text-comment">
                        {data.user.tgUsername[0]}
                    </span>
                {/if}
            </a>
        {:else}
            <button
                class="btn h-full ml-2.5"
                onclick={() => new MyWindow("login").open()}>Войти</button
            >
        {/if}
    </header>
    <main class="flex flex-col items-stretch">
        {@render children()}
    </main>
</div>
