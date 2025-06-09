<script lang="ts">
    import api from "$lib/api";
    import type { CalendarEvent } from "itam-edu-common";
    import type { PageData } from "./$types";
    import type { CoursePartial } from "$lib/types";
    import { coursePath } from "$lib/path";
    import {
        endOfDay,
        format as formatDate,
        isSameDay,
        startOfDay
    } from "date-fns";

    let {
        data,
        selected = $bindable(null),
        highlighted = $bindable(null)
    }: Props = $props();
    type Props = {
        data: PageData;
        selected?: Date | null;
        highlighted?: Date | null;
    };

    const getEvents = async (date: Date) => {
        if (!selected) return data.calendar;
        const result = await api({ fetch }).users.me.calendar.get({
            query: {
                after: startOfDay(selected).toISOString(),
                before: endOfDay(selected).toISOString()
            }
        });
        if (result.error) {
            return [];
        }
        return result.data;
    };

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

{#if !selected}
    <h5>Ближайшие события</h5>
    <ul class="flex flex-col gap-3">
        {#each data.calendar as event}
            {@render eventCard(event)}
        {:else}
            <div class="m-auto pt-6 pb-8 text-lg-regular text-on-surface">
                Ничего! Можно
                <a
                    class={[
                        "after:content-['отдыхать']",
                        "hover:after:content-['хакатонить']",
                        "hover:underline hover:italic not-after"
                    ]}
                    aria-label="отдыхать"
                    target="_blank"
                    href="https://info.itatmisis.ru/calendar"
                ></a>
                🌅
            </div>
        {/each}
    </ul>
{:else}
    {#await getEvents(selected) then events}
        {#if events.length > 0}
            <h5>Cобытия {formatDate(selected, "dd.MM.yyyy")}</h5>
            <ul class="flex flex-col gap-3">
                {#each events as event}
                    {@render eventCard(event)}
                {/each}
            </ul>
        {/if}
    {/await}
{/if}

{#snippet eventCard(event: CalendarEvent)}
    {@const course = data.courses.find(c => c.id === event.courseId)!}
    {@const href = eventToHref(course, event)}
    {@const isHighlighted =
        highlighted && isSameDay(highlighted, event.datetime)}
    <a
        class={[
            "flex items-center gap-2 p-2 bg-surface-tint border rounded-sm",
            "transition-colors duration-200",
            isHighlighted ? "border-primary" : "border-surface-border"
        ]}
        {href}
        onmouseenter={() => (highlighted = event.datetime)}
        onmouseleave={() => (highlighted = null)}
    >
        <div class="flex flex-col border-r border-primary p-2">
            <span class="text-on-surface">
                {formatDate(event.datetime, "dd.MM")}
            </span>
            <span class="text-on-surface-muted">
                {formatDate(event.datetime, "HH.mm")}
            </span>
        </div>
        <div class="flex flex-col whitespace-nowrap overflow-hidden">
            <span class="text-on-surface overflow-hidden overflow-ellipsis">
                {course.title}
            </span>
            <span
                class="text-on-surface-muted overflow-hidden overflow-ellipsis"
            >
                {event.title}
            </span>
        </div>
    </a>
{/snippet}
