<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import "../../app.css";

    let { children } = $props();

    const linkClasses = (selected: boolean) => [
        selected
            ? "bg-primary text-text"
            : "text-text-opaque hover:bg-surface-light hover:text-text",
        "flex justify-left items-center h-12 px-4 gap-2.5 rounded-sm"
    ];
</script>

<svelte:head>
    <title>ITAM.Education</title>
</svelte:head>

<div
    class={[
        "grid grid-cols-[200px_1fr] grid-rows-[80px_1fr] gap-x-5",
        "h-full p-5 bg-surface-dark"
    ]}
>
    <header
        class={[
            "col-start-2 row-start-1",
            "flex items-center gap-4 px-6 py-5",
            "bg-surface rounded"
        ]}
    >
        <div class="flex-1"></div>
        <button
            aria-label="Notifications"
            class="rounded-sm h-10 w-10 hover:bg-surface-light"
        >
            <i class="ph-fill ph-bell block text-text h-[24px] text-[24px]"></i>
        </button>
        <img
            alt="Profile"
            class="rounded-full bg-white aspect-square h-full overflow-hidden"
        />
    </header>
    <aside
        class={[
            "col-start-1 row-start-1 row-span-2",
            "flex flex-col w-[200px] gap-2.5 px-4 py-5 bg-surface rounded"
        ]}
    >
        <a class={linkClasses(page.url.pathname === "/admin")} href="/admin">
            <i class="ph-fill ph-house text-xl"></i>
            <span>Home</span>
        </a>
        <a
            class={linkClasses(page.url.pathname.startsWith("/admin/courses"))}
            href="/admin/courses"
        >
            <i class="ph-fill ph-chalkboard-simple text-xl"></i>
            <span>Courses</span>
        </a>
        <a
            class={linkClasses(page.url.pathname.startsWith("/admin/students"))}
            href="/admin/students"
        >
            <i class="ph-fill ph-student text-xl"></i>
            <span>Students</span>
        </a>
        <a
            class={linkClasses(page.url.pathname.startsWith("/admin/calendar"))}
            href="/admin/calendar"
        >
            <i class="ph-fill ph-calendar text-xl"></i>
            <span>Calendar</span>
        </a>
        <div class="flex-1"></div>
        <a
            class={linkClasses(page.url.pathname.startsWith("/admin/settings"))}
            href="/admin/settings"
        >
            <i class="ph-fill ph-gear text-xl"></i>
            <span>Settings</span>
        </a>
        <button
            class="flex justify-left items-center h-12 px-4 gap-2.5 text-text-opaque hover:bg-primary hover:text-text rounded-sm"
            onclick={() => goto("/")}
        >
            <i class="ph-fill ph-sign-out text-xl"></i>
            <span>Log out</span>
        </button>
    </aside>
    <main class="col-start-2 row-start-2 overflow-y-auto">
        {@render children()}
    </main>
</div>
