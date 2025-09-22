<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import type { CoursePartial } from "$lib/types";
    import CourseCard from "./CourseCard.svelte";
    import TinyCalendar from "./TinyCalendar.svelte";
    import EventsList from "./EventsList.svelte";
    import AcceptInviteModal from "./AcceptInviteModal.svelte";
    import { page } from "$app/state";

    let { data } = $props();

    let highlightedDate: Date | null = $state(null);
    let selectedDate: Date | null = $state(null);

    const tabs = data.user
        ? (["my", "active", "archive"] as const)
        : (["active", "archive"] as const);
    type Tab = (typeof tabs)[number];
    const tab = $derived.by<Tab>(() => {
        const param = page.url.searchParams.get("tab");
        if (tabs.some(t => t === param)) return param as Tab;
        return tabs[0];
    });

    let filter = $derived.by((): ((c: CoursePartial) => boolean) => {
        switch (tab) {
            case "my":
                return c => {
                    if (data.user === null) return false;
                    if (c.isArchived) return false;
                    if (!data.user.isCourseMember(c.id)) return false;
                    return true;
                };
            case "active":
                return c => !c.isArchived;
            case "archive":
                return c => c.isArchived;
        }
    });
</script>

<AcceptInviteModal user={data.user} />

<div id="wrapper" class="flex flex-col bg-background">
    <Header user={data.user} courses={data.courses} standalone />
    <main
        class="grid grid-cols-[1fr_auto] grid-rows-[auto_1fr] content-start py-12.5 px-7.5 gap-7.5"
    >
        <menu class="flex h-12 gap-2">
            {#if data.user !== null}
                <a
                    class={["tabBtn", tab === "my" && "selected"]}
                    href={`${page.url.origin}${page.url.pathname}`}
                >
                    Мои
                </a>
                <a
                    class={["tabBtn", tab === "active" && "selected"]}
                    href={`${page.url.origin}${page.url.pathname}?tab=active`}
                >
                    Текущие
                </a>
            {:else}
                <a
                    class={["tabBtn", tab === "active" && "selected"]}
                    href={`${page.url.origin}${page.url.pathname}`}
                >
                    Текущие
                </a>
            {/if}
            <a
                class={["tabBtn", tab === "archive" && "selected"]}
                href={`${page.url.origin}${page.url.pathname}?tab=archive`}
            >
                Архивные
            </a>
        </menu>
        <aside
            class="row-span-2 w-[400px] h-min flex flex-col gap-5 p-5 border border-on-primary rounded-sm"
        >
            <TinyCalendar
                user={data.user}
                bind:selected={selectedDate}
                bind:highlighted={highlightedDate}
            />
            <EventsList
                user={data.user}
                courses={data.courses}
                bind:selected={selectedDate}
                bind:highlighted={highlightedDate}
            />
        </aside>
        <section
            class="grid grid-cols-[repeat(auto-fill,317px)] h-min items-start gap-x-4 gap-y-6.5"
        >
            {#each data.courses.filter(filter) as course (course.id)}
                <CourseCard {course} />
            {/each}
        </section>
    </main>
</div>
