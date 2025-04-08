<script lang="ts">
    import type { Lesson } from "$lib/types";

    let { schedule = $bindable() }: Props = $props();

    type Props = {
        schedule: Lesson["schedule"] | null;
    };

    let saved: Lesson["schedule"] = $state(null);
</script>

<section class="flex flex-col gap-8 p-7.5 rounded-xl bg-surface shadow">
    <header class="flex flex-col gap-2">
        <h3>Планирование занятия</h3>
        <p class="max-w-[800px] text-balance">
            Запланируйте занятие, чтобы оно отобразилось в календаре. Студенты и
            преподаватели получат уведомление в зависимости от своих настроек.
        </p>
    </header>
    {#if schedule === null}
        <button
            class="btn w-min text-nowrap"
            onclick={() =>
                (schedule = saved ?? {
                    online: null,
                    offline: null,
                    date: new Date()
                })}
        >
            <i class="ph ph-calendar-check text-[20px]"></i>
            Запланировать занятие
        </button>
    {:else}
        <div class="flex flex-wrap gap-8">
            <label class="shrink flex flex-col gap-2 min-w-[300px]">
                <h4>Дата</h4>
                <input
                    class="input"
                    type="date"
                    required
                    bind:value={() => {
                        return schedule!.date.toISOString().split("T")[0];
                    },
                    val => {
                        if (val === "") return;
                        schedule!.date = new Date(
                            val +
                                "T" +
                                schedule!.date.toTimeString().substring(0, 5)
                        );
                    }}
                />
            </label>
            <label class="shrink flex flex-col gap-2 min-w-[200px]">
                <h4>Время</h4>
                <input
                    class="input"
                    type="time"
                    required
                    bind:value={() => {
                        return schedule!.date.toTimeString().substring(0, 5);
                    },
                    val => {
                        if (val === "") return;
                        schedule!.date = new Date(
                            `${schedule!.date.toISOString().split("T")[0]}T${val}`
                        );
                    }}
                />
            </label>
        </div>
        <div class="flex flex-col gap-2">
            <h4>Формат</h4>
            <label>
                <input
                    type="checkbox"
                    bind:checked={() => schedule!.online !== null,
                    val => (schedule!.online = val ? {} : null)}
                />
                Провести занятие онлайн
            </label>
        </div>
        <label class="flex flex-col gap-2">
            <h4>Офлайн-занятие</h4>
            <label>
                <input
                    type="checkbox"
                    bind:checked={() => schedule!.offline !== null,
                    val => (schedule!.offline = val ? { location: "" } : null)}
                />
                Провести занятие офлайн
            </label>
            {#if schedule.offline}
                <input
                    class="input"
                    placeholder="Место проведения"
                    maxlength="60"
                    bind:value={schedule.offline.location}
                />
            {/if}
        </label>
        <button
            class="btn secondary w-min text-nowrap"
            onclick={() => {
                saved = schedule;
                schedule = null;
            }}
        >
            <i class="ph ph-calendar-slash text-[18px]"></i>
            Не планировать занятие
        </button>
    {/if}
</section>
