<script lang="ts">
    import Header from "$lib/components/Header.svelte";
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
    <Header user={data.user} />
    <main class="flex flex-col items-stretch @container/main">
        {@render children()}
    </main>
</div>
