<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import { setContext } from "svelte";
    import CourseSidebar from "./CourseSidebar.svelte";
    import { getColors, type Theme } from "$lib/theme";

    let { data, children } = $props();

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
    class="grid grid-cols-[278px_1fr] grid-rows-[56px_1fr] min-h-dvh bg-background"
    style:--color-primary={colors.primary}
    style:--color-on-primary={colors.onPrimary}
    style:--color-primary-border={colors.primaryBorder}
>
    <CourseSidebar
        course={data.course}
        courses={data.courses}
        user={data.user}
    />
    <Header
        user={data.user}
        notifications={data.notifications}
        courses={data.courses}
    />
    <main class="relative z-0 flex flex-col items-stretch @container/main">
        {#if data.course.isArchived}
            <div
                class={[
                    "flex justify-center items-center gap-2 w-full h-10",
                    "bg-on-primary text-primary text-lg-regular border-b border-primary-border"
                ]}
            >
                Этот курс находится в архиве. Он доступен только для просмотра.
            </div>
        {/if}
        {@render children()}
    </main>
</div>
