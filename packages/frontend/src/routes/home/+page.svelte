<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import type { Course } from "$lib/types";
    import CourseCard from "./CourseCard.svelte";

    let { data } = $props();

    let filterKind: "my" | "active" | "archive" = $state("my");
    let filter = $derived.by((): ((c: Course) => boolean) => {
        switch (filterKind) {
            case "my":
                return c =>
                    data.enrollments?.some(e => c.id === e.courseId) === true ||
                    data.permissions?.course.some(p => c.id === p.courseId) ===
                        true;
            case "active":
                return c => !c.isArchived;
            case "archive":
                return c => c.isArchived;
        }
    });
    let courses = $derived(data.courses.filter(filter));
</script>

<div id="wrapper" class="flex flex-col bg-background">
    <Header user={data.user} standalone />
    <main
        class="grid grid-cols-[1fr_373px] grid-rows-[auto_1fr] content-start py-15 px-7.5 gap-7.5"
    >
        <menu class="flex gap-2">
            {@render fltr("Мои", "my")}
            {@render fltr("Текущие", "active")}
            {@render fltr("Архивные", "archive")}
        </menu>
        <aside class="row-span-2">
            <!-- TODO: calenfar -->
        </aside>
        <section
            class={[
                "grid grid-cols-[repeat(auto-fill,343px)] gap-x-4 gap-y-6.5"
            ]}
        >
            {#each courses as course}
                <CourseCard {course} />
            {/each}
        </section>
    </main>
</div>

{#snippet fltr(text: string, key: typeof filterKind)}
    <button
        class={["btn", filterKind === key ? "" : "text-primary bg-on-primary"]}
        onclick={() => (filterKind = key)}>{text}</button
    >
{/snippet}
