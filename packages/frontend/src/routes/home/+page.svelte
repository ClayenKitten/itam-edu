<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import type { Course, CoursePartial } from "$lib/types";
    import type { CalendarEvent } from "itam-edu-common";
    import CourseCard from "./CourseCard.svelte";
    import { coursePath } from "$lib/path";
    import { format as formatDate } from "date-fns";

    let { data } = $props();

    let filterKind: "my" | "active" | "archive" = $state("my");
    let filter = $derived.by((): ((c: CoursePartial) => boolean) => {
        switch (filterKind) {
            case "my":
                return c =>
                    (data.user?.isCourseStudent(c.id) ||
                        data.user?.isCourseStaff(c.id)) === true;
            case "active":
                return c => !c.isArchived;
            case "archive":
                return c => c.isArchived;
        }
    });
    let courses = $derived(data.courses.filter(filter));

    const eventToHref = (course: CoursePartial, event: CalendarEvent) => {
        switch (event.kind) {
            case "homework":
                return `${coursePath(course)}/homeworks/${event.id}`;
            case "lesson":
                return `${coursePath(course)}/lessons/${event.id}`;
            default:
                let _: never = event;
                break;
        }
        return coursePath(course) ?? "/home";
    };
</script>

<svelte:head>
    <title>Главная | ITAM Education</title>
</svelte:head>

<div id="wrapper" class="flex flex-col bg-background">
    <Header user={data.user} standalone />
    <main
        class="grid grid-cols-[1fr_auto] grid-rows-[auto_1fr] content-start py-15 px-7.5 gap-7.5"
    >
        <menu class="flex gap-2">
            {@render fltr("Мои", "my")}
            {@render fltr("Текущие", "active")}
            {@render fltr("Архивные", "archive")}
        </menu>
        <aside
            class="row-span-2 w-[400px] h-min flex flex-col gap-5 p-5 border border-on-primary rounded-sm"
        >
            <h5>Ближайшие события</h5>
            <ul class="flex flex-col gap-3">
                {#each data.calendar as event}
                    {@const course = data.courses.find(
                        c => c.id === event.courseId
                    )!}
                    {@const href = eventToHref(course, event)}
                    <a
                        class="flex items-center gap-2 p-2 bg-surface-tint rounded-sm"
                        {href}
                    >
                        <div class="flex flex-col border-r border-primary p-2">
                            <span class="text-on-surface">
                                {formatDate(event.datetime, "dd.MM")}
                            </span>
                            <span class="text-on-surface-muted">
                                {formatDate(event.datetime, "HH.mm")}
                            </span>
                        </div>
                        <div
                            class="flex flex-col whitespace-nowrap overflow-hidden"
                        >
                            <span
                                class="text-on-surface overflow-hidden overflow-ellipsis"
                            >
                                {course.title}
                            </span>
                            <span
                                class="text-on-surface-muted overflow-hidden overflow-ellipsis"
                            >
                                {event.title}
                            </span>
                        </div>
                    </a>
                {/each}
            </ul>
        </aside>
        <section
            class={[
                "grid grid-cols-[repeat(auto-fill,317px)] items-start gap-x-4 gap-y-6.5"
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
        class={["btn", filterKind === key ? "" : "secondary"]}
        onclick={() => (filterKind = key)}>{text}</button
    >
{/snippet}
