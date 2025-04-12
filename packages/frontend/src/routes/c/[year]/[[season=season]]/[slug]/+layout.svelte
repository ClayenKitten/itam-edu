<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import { setContext, type Snippet } from "svelte";
    import CourseSidebar from "./CourseSidebar.svelte";

    let { data, children } = $props();

    const layout: { additionalSidebar: Snippet | null } = $state({
        additionalSidebar: null
    });

    setContext("layout", layout);
</script>

<div
    id="wrapper"
    class={[
        "grid grid-rows-[56px_1fr] min-h-dvh bg-background",
        layout.additionalSidebar === null
            ? "grid-cols-[278px_1fr]"
            : "grid-cols-[278px_278px_1fr]"
    ]}
    style:--color-primary={data.course.colorPrimary}
    style:--color-on-primary={data.course.colorOnPrimary}
>
    <CourseSidebar
        course={data.course}
        courses={data.courses}
        isEmployee={data.user?.isCourseStaff(data.course.id) === true}
    />
    {#if layout.additionalSidebar}
        <aside
            class={[
                "sticky top-0 h-dvh overflow-y-auto col-start-2 row-start-1 row-span-2",
                "bg-surface border-r border-surface-border"
            ]}
            style:scrollbar-width="thin"
            style:scrollbar-gutter="stable"
        >
            {@render layout.additionalSidebar?.()}
        </aside>
    {/if}
    <Header user={data.user} />
    <main class="relative z-0 flex flex-col items-stretch @container/main">
        {@render children()}
    </main>
</div>
