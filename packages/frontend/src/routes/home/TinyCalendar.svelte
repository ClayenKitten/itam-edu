<script lang="ts">
    import api from "$lib/api";
    import {
        addMonths,
        eachDayOfInterval,
        endOfDay,
        endOfWeek,
        format as formatDate,
        isSameDay,
        isSameMonth,
        lastDayOfMonth,
        set,
        startOfDay,
        startOfWeek,
        subMonths
    } from "date-fns";
    import { ru } from "date-fns/locale";

    let { selected = $bindable(null), highlighted = $bindable(null) }: Props =
        $props();
    type Props = {
        selected?: Date | null;
        highlighted?: Date | null;
    };

    let firstMonthDay = $state(
        set(new Date(), { date: 1, hours: 12, minutes: 0, seconds: 0 })
    );
    const lastMonthDay = $derived(lastDayOfMonth(firstMonthDay));

    const monthDays = $derived(
        eachDayOfInterval({
            start: startOfWeek(firstMonthDay, { weekStartsOn: 1 }),
            end: endOfWeek(lastMonthDay, { weekStartsOn: 1 })
        })
    );

    let eventsPromise = $derived.by(async () => {
        const result = await api({ fetch }).users.me.calendar.get({
            query: {
                after: startOfDay(firstMonthDay).toISOString(),
                before: endOfDay(lastMonthDay).toISOString()
            }
        });
        if (result.error) {
            return [];
        }
        return result.data;
    });
    const select = (newSelected: Date) => {
        if (selected && isSameDay(selected, newSelected)) {
            selected = null;
        } else {
            selected = newSelected;
        }
    };
    const changeMonth = (n: number) => {
        firstMonthDay = addMonths(firstMonthDay, n);
        selected = null;
    };
</script>

<article class="flex flex-col gap-6">
    <header class="flex justify-between items-center">
        <button
            class={[
                "h-9 w-9 bg-surface-tint",
                "border border-surface-border rounded-2xs",
                "hover:bg-on-primary hover:border-primary-border",
                "transition-colors duration-100"
            ]}
            aria-label="Предыдущий месяц"
            onclick={() => changeMonth(-1)}
        >
            <i class="ph ph-caret-left"></i>
        </button>
        <span class="text-xl-medium capitalize">
            {formatDate(firstMonthDay, "LLLL yyyy", { locale: ru })}
        </span>
        <button
            class={[
                "h-9 w-9 bg-surface-tint",
                "border border-surface-border rounded-2xs",
                "hover:bg-on-primary hover:border-primary-border",
                "transition-colors duration-100"
            ]}
            aria-label="Следующий месяц"
            onclick={() => changeMonth(1)}
        >
            <i class="ph ph-caret-right"></i>
        </button>
    </header>
    <div class="grid grid-cols-7 gap-2.5 place-items-center cursor-default">
        {#each ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"] as weekday}
            <div class="text-md-medium text-on-surface-muted">{weekday}</div>
        {/each}
        {#each monthDays as currentDate}
            {@render date(currentDate)}
        {/each}
    </div>
</article>

{#snippet date(currentDate: Date)}
    {@const isToday = isSameDay(new Date(), currentDate)}
    {@const isDisabled = !isSameMonth(currentDate, firstMonthDay)}
    {@const isSelected = selected && isSameDay(currentDate, selected)}
    {@const isHighlighted = highlighted && isSameDay(currentDate, highlighted)}

    <button
        class={[
            "relative flex justify-center items-center w-10 h-10",
            "border rounded-2xs",
            "transition-colors duration-200",
            "text-md-regular disabled:text-on-surface-muted",
            {
                "bg-primary": isSelected,
                "bg-surface-tint": isToday && !isSelected,
                "bg-on-primary": isHighlighted
            },
            {
                "border-primary": !isDisabled && (isSelected || isHighlighted),
                "border-surface-border": isToday && !isSelected,
                "hover:border-primary": !isSelected && !isDisabled,
                "border-surface": !isSelected && !isToday && !isHighlighted
            },
            {
                "text-on-surface-contrast": !isDisabled && !isSelected,
                "text-on-primary": isSelected,
                "text-on-surface-muted opacity-60": isDisabled
            },
            isDisabled ? "cursor-default" : "cursor-pointer"
        ]}
        disabled={isDisabled}
        onclick={() => select(currentDate)}
        onmouseenter={() => !isDisabled && (highlighted = currentDate)}
        onmouseleave={() => !isDisabled && (highlighted = null)}
    >
        <span>{currentDate.getDate()}</span>

        {#await eventsPromise then events}
            {@const todayEvents = events.filter(e =>
                isSameDay(e.datetime, currentDate)
            )}
            {#if todayEvents.length > 0}
                <div
                    class={[
                        "absolute -top-[14px] text-[24px]",
                        "transition-opacity duration-100",
                        isSelected ? "opacity-0" : "opacity-100"
                    ]}
                >
                    {#each todayEvents as todayEvent}
                        <span
                            class={todayEvent.kind === "homework"
                                ? "text-[#c20101]"
                                : "text-primary"}>.</span
                        >
                    {/each}
                </div>
            {/if}
        {/await}
    </button>
{/snippet}
