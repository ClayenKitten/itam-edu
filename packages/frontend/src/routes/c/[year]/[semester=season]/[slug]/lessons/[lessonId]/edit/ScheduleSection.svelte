<script lang="ts">
    import type { LessonSchedule } from "$lib/types";
    import { set } from "date-fns";

    let { schedule = $bindable() }: Props = $props();

    type Props = {
        schedule: LessonSchedule | null;
    };

    let saved: LessonSchedule | null = $state(null);

    const formatDate = (date: Date): { date: string; time: string } => {
        let d = date.toLocaleDateString("ru-RU", {
            timeZone: "Europe/Moscow"
        });
        return {
            date: `${d.substring(6, 10)}-${d.substring(3, 5)}-${d.substring(0, 2)}`,
            time: date
                .toLocaleTimeString("ru-RU", {
                    timeZone: "Europe/Moscow"
                })
                .substring(0, 5)
        };
    };
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <header class="flex flex-col gap-1">
        <h3>Планирование урока</h3>
        <p class="text-on-surface-muted">
            Запланируйте урок, чтобы он отобразился в календаре.
        </p>
    </header>
    {#if schedule === null}
        <button
            class="btn w-max"
            onclick={() => {
                schedule = saved ?? {
                    date: set(new Date(), {
                        hours: 18,
                        minutes: 30,
                        seconds: 0,
                        milliseconds: 0
                    }),
                    location: null,
                    isOnline: true
                };
            }}
        >
            <i class="ph ph-calendar-check text-[20px]"></i>
            Запланировать урок
        </button>
    {:else}
        <div class="flex flex-col gap-2">
            <div class="flex flex-wrap gap-2">
                <input
                    class="input px-6"
                    type="date"
                    required
                    bind:value={
                        () => formatDate(schedule!.date).date,
                        val => {
                            if (val === "") return;
                            schedule!.date = new Date(
                                val + "T" + formatDate(schedule!.date).time
                            );
                        }
                    }
                />
                <input
                    class="input"
                    type="time"
                    required
                    bind:value={
                        () => formatDate(schedule!.date).time,
                        val => {
                            if (val === "") return;
                            schedule!.date = new Date(
                                formatDate(schedule!.date).date + "T" + val
                            );
                        }
                    }
                />
                <input
                    class="input w-80"
                    placeholder={'Место проведения, напр. "Б-3"'}
                    maxlength={60}
                    bind:value={schedule.location}
                />
            </div>
            <label>
                <input type="checkbox" bind:checked={schedule.isOnline} />
                Провести онлайн-трансляцию
            </label>
        </div>
        <button
            class="btn secondary w-max"
            onclick={() => {
                saved = schedule;
                schedule = null;
            }}
        >
            <i class="ph ph-calendar-slash text-[18px]"></i>
            Не планировать урок
        </button>
    {/if}
</section>
