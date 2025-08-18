<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import { setContext, type Snippet } from "svelte";
    import CourseSidebar from "./CourseSidebar.svelte";
    import { getColors, type Theme } from "$lib/theme";

    let { data, children } = $props();

    const layout: { additionalSidebar: Snippet | null } = $state({
        additionalSidebar: null
    });
    setContext("layout", layout);

    const themeContainer = $state({ theme: data.course.theme as Theme });
    setContext("theme", themeContainer);

    const colors = $derived(getColors(themeContainer.theme));
</script>

<svelte:head>
    {#if data.course.description}
        <meta name="description" content={data.course.description} />
        <meta property="og:description" content={data.course.description} />
    {/if}
    {#if data.course.icon}
        <link
            rel="icon"
            href={`/files/courses/${data.course.id}/${data.course.icon}`}
        />
    {/if}
</svelte:head>

<div
    id="wrapper"
    class={[
        "grid grid-rows-[56px_1fr] min-h-dvh bg-background",
        layout.additionalSidebar === null
            ? "grid-cols-[278px_1fr]"
            : "grid-cols-[278px_278px_1fr]"
    ]}
    style:--color-primary={colors.primary}
    style:--color-on-primary={colors.onPrimary}
    style:--color-primary-border={colors.primaryBorder}
>
    <CourseSidebar
        course={data.course}
        courses={data.courses}
        user={data.user}
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
    <Header
        user={data.user}
        notifications={data.notifications}
        courses={data.courses}
    />
    <main class="relative z-0 flex flex-col items-stretch @container/main">
        {@render children()}
    </main>
</div>
