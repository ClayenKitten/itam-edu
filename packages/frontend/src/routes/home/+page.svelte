<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import type { CoursePartial } from "$lib/types";
    import CourseCard from "./CourseCard.svelte";
    import TinyCalendar from "./TinyCalendar.svelte";
    import EventsList from "./EventsList.svelte";
    import CreateCourseWindow from "$lib/windows/CreateCourseWindow.svelte";

    let { data } = $props();

    let createCourseWindow: CreateCourseWindow;

    let highlightedDate: Date | null = $state(null);
    let selectedDate: Date | null = $state(null);

    let filterKind: "my" | "active" | "archive" = $state(
        data.user === null ? "active" : "my"
    );
    let filter = $derived.by((): ((c: CoursePartial) => boolean) => {
        switch (filterKind) {
            case "my":
                return c =>
                    !c.isArchived &&
                    (data.user?.isCourseStudent(c.id) ||
                        data.user?.isCourseStaff(c.id)) === true;
            case "active":
                return c => !c.isArchived;
            case "archive":
                return c => c.isArchived;
        }
    });
    let courses = $derived(data.courses.filter(filter));
</script>

<svelte:head>
    <title>Главная | ITAM Education</title>
</svelte:head>

<CreateCourseWindow bind:this={createCourseWindow} />

<div id="wrapper" class="flex flex-col bg-background">
    <Header
        user={data.user}
        notifications={data.notifications}
        courses={data.courses}
        standalone
    />
    <main
        class="grid grid-cols-[1fr_auto] grid-rows-[auto_1fr] content-start py-12.5 px-7.5 gap-7.5"
    >
        <menu class="flex gap-2">
            {#if data.user !== null}
                {@render fltr("Мои", "my")}
            {/if}
            {@render fltr("Текущие", "active")}
            {@render fltr("Архивные", "archive")}
        </menu>
        <aside
            class="row-span-2 w-[400px] h-min flex flex-col gap-5 p-5 border border-on-primary rounded-sm"
        >
            <TinyCalendar
                bind:selected={selectedDate}
                bind:highlighted={highlightedDate}
            />
            <EventsList
                {data}
                bind:selected={selectedDate}
                bind:highlighted={highlightedDate}
            />
        </aside>
        <section
            class="grid grid-cols-[repeat(auto-fill,317px)] h-min items-start gap-x-4 gap-y-6.5"
        >
            {#each courses as course}
                <CourseCard {course} />
            {/each}
            {#if data.user && data.user.permissions.createCourses === true}
                <menu class="col-span-full">
                    <button
                        class="btn h-11"
                        onclick={() => {
                            createCourseWindow.show();
                        }}
                    >
                        <i class="ph ph-plus text-on-primary text-[20px]"></i>
                        Создать новый курс
                    </button>
                </menu>
            {/if}
        </section>
    </main>
</div>

{#snippet fltr(text: string, key: typeof filterKind)}
    <button
        class={[
            "h-12 px-5 py-3",
            "text-lg-medium border rounded-xs shadow",
            "transition-colors duration-100",
            filterKind === key
                ? "bg-primary text-on-primary border-primary cursor-default"
                : [
                      "bg-surface text-on-surface border-surface-border",
                      "hover:bg-on-primary hover:text-primary hover:border-primary-border"
                  ]
        ]}
        onclick={() => (filterKind = key)}>{text}</button
    >
{/snippet}
