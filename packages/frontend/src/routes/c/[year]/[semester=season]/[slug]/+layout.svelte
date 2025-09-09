<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import CourseSidebar from "./CourseSidebar.svelte";
    import { getColors, type Theme } from "$lib/metadata";
    import { setContext } from "svelte";
    import { onNavigate } from "$app/navigation";

    let { data, children } = $props();

    // Theme override to preview changes on course settings page.
    const themeOverride = $state<{ theme: Theme | null }>({ theme: null });
    onNavigate(() => {
        themeOverride.theme = null;
    });
    setContext("themeOverride", themeOverride);
    const colors = $derived.by(() => {
        if (themeOverride.theme) {
            return getColors(themeOverride.theme);
        }
        return getColors(data.theme);
    });
</script>

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
    <Header user={data.user} courses={data.courses} />
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
