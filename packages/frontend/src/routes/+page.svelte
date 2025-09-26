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

    const tabs = $derived(
        data.user
            ? (["my", "active", "archive"] as const)
            : (["active", "archive"] as const)
    );
    type Tab = (typeof tabs)[number];
    const tab = $derived.by<Tab>(() => {
        const param = page.url.searchParams.get("tab");
        if (tabs.some(t => t === param)) return param as Tab;
        return tabs[0];
    });

    const my = $derived(
        data.courses.filter(c => {
            if (data.user === null) return false;
            if (c.isArchived) return false;
            if (!data.user.isCourseMember(c.id)) return false;
            return true;
        })
    );
    const active = $derived(data.courses.filter(c => !c.isArchived));
    const archived = $derived(data.courses.filter(c => c.isArchived));
    const displayed = $derived.by(() => {
        switch (tab) {
            case "my":
                return my;
            case "active":
                return active;
            case "archive":
                return archived;
            default:
                let guard: never = tab;
                return [];
        }
    });
</script>

<AcceptInviteModal user={data.user} />

<div id="wrapper" class="flex flex-col bg-background">
    <Header user={data.user} courses={data.courses} standalone />
    <div class="flex py-12.5 px-7.5 gap-7.5">
        <div class="flex-1 flex flex-col gap-7.5">
            {#if data.user !== null || archived.length > 0}
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
                    {#if archived.length > 0}
                        <a
                            class={["tabBtn", tab === "archive" && "selected"]}
                            href={`${page.url.origin}${page.url.pathname}?tab=archive`}
                        >
                            Архивные
                        </a>
                    {/if}
                </menu>
            {/if}
            {#if displayed.length > 0}
                <main
                    class="grid grid-cols-[repeat(auto-fill,317px)] h-min items-start gap-x-4 gap-y-6.5"
                >
                    {#each displayed as course (course.id)}
                        <CourseCard {course} />
                    {/each}
                </main>
            {:else}
                <main class="flex flex-col mt-[25dvh] items-center gap-2">
                    {#if tab === "my"}
                        <h4 class="text-on-surface-contrast">
                            Пора записаться на курс! 🎓
                        </h4>
                        <span class="text-lg-regular text-on-surface-muted">
                            Посмотреть список идущих сейчас курсов можно в
                            <a
                                class="text-primary underline"
                                href="?tab=active"
                            >
                                соседней вкладке
                            </a>.
                        </span>
                    {:else}
                        <h4 class="text-on-surface-contrast">
                            Как-то здесь пустовато! 🫒
                        </h4>
                        <span class="text-lg-regular text-on-surface-muted">
                            Ждать появления курсов приятнее с друзьями в
                            <a
                                class="text-primary underline"
                                href="https://info.itatmisis.ru/coworking"
                                target="_blank"
                            >
                                коворкинге
                            </a>.
                        </span>
                    {/if}
                </main>
            {/if}
        </div>
        <aside
            class="shrink-0 w-[400px] h-min flex flex-col gap-5 p-5 border border-on-primary rounded-sm"
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
    </div>
</div>
