<script lang="ts">
    import type { Lesson } from "$lib/types";
    import { set } from "date-fns";

    let { schedule = $bindable() }: Props = $props();

    type Props = {
        schedule: Lesson["schedule"] | null;
    };

    let saved: Lesson["schedule"] = $state(null);

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

<section class="flex flex-col gap-8 p-7.5 rounded-xl bg-surface shadow">
    <header class="flex flex-col gap-2">
        <h3>Планирование урока</h3>
        <p class="max-w-[800px] text-balance">
            Запланируйте урок, чтобы он отобразился в календаре. Студенты и
            преподаватели получат уведомление в зависимости от своих настроек.
        </p>
    </header>
    {#if schedule === null}
        <button
            class="btn w-max"
            onclick={() => {
                schedule = saved ?? {
                    online: null,
                    offline: null,
                    date: set(new Date(), {
                        hours: 18,
                        minutes: 30,
                        seconds: 0,
                        milliseconds: 0
                    })
                };
            }}
        >
            <i class="ph ph-calendar-check text-[20px]"></i>
            Запланировать урок
        </button>
    {:else}
        <div class="shrink flex flex-col gap-2 min-w-[360px]">
            <h4>Дата и время</h4>
            <div class="flex gap-2">
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
            </div>
        </div>
        <div class="flex flex-col gap-2">
            <h4>Формат проведения</h4>
            <div class="flex gap-8">
                <div class="w-80 flex flex-col gap-2">
                    <label>
                        <input
                            type="checkbox"
                            bind:checked={
                                () => schedule!.offline !== null,
                                val =>
                                    (schedule!.offline = val
                                        ? { location: "" }
                                        : null)
                            }
                        />
                        Провести урок очно
                    </label>
                    {#if schedule.offline}
                        <input
                            class="input"
                            placeholder="Место проведения"
                            maxlength={60}
                            bind:value={schedule.offline.location}
                        />
                    {/if}
                </div>
                <div class="w-80 flex flex-col gap-2">
                    <label>
                        <input
                            type="checkbox"
                            bind:checked={
                                () => schedule!.online !== null,
                                val => (schedule!.online = val ? {} : null)
                            }
                        />
                        Провести урок онлайн
                    </label>
                </div>
            </div>
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
