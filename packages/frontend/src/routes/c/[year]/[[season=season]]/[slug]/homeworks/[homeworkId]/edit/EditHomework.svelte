<script lang="ts">
    import TipTap from "$lib/components/TipTap.svelte";
    import { getToaster } from "$lib/Toaster.svelte";
    import type { CreateHomework, Homework } from "$lib/types";

    let { homework = $bindable(), onsave, oncancel }: Props = $props();
    type Props = {
        homework: Homework | CreateHomework;
        onsave: () => void;
        oncancel: () => void;
    };
    const toaster = getToaster();

    const validate = (): boolean => {
        if (homework.title.length <= 3) {
            toaster.add("Слишком короткое название", "error");
            return false;
        }
        return true;
    };

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
    <header class="flex flex-col gap-2">
        {#if "position" in homework}
            <h2>Задание {homework.position + 1}</h2>
        {:else}
            <h2>Новое задание</h2>
        {/if}
    </header>
    <label class="flex flex-col gap-2">
        <h4>Название</h4>
        <input class="input" bind:value={homework.title} />
    </label>
    <div class="flex gap-5">
        <label class="flex flex-col gap-2">
            <h4>Дедлайн</h4>
            <input
                class="input h-15 border border-on-primary focus:border-primary rounded-sm"
                type="date"
                bind:value={
                    () =>
                        homework.deadline
                            ? formatDate(homework.deadline).date
                            : null,
                    val => {
                        if (val === "") homework.deadline = null;
                        homework.deadline = new Date(val + "T23:59:59");
                    }
                }
            />
        </label>
        <label class="flex flex-col gap-2">
            <h4>Приём работ</h4>
            <select
                class="input h-15 border border-on-primary focus:border-primary rounded-sm"
                bind:value={homework.deadlineOverride}
            >
                <option value={null}>Открыт до дедлайна</option>
                <option value={true}>Открыт всегда</option>
                <option value={false}>Закрыт</option>
            </select>
        </label>
    </div>
    <div class="flex flex-col gap-2">
        <h4>Задание</h4>
        <div
            class="h-full min-h-[300px] p-5 border-2 border-on-primary rounded-sm focus-within:border-primary"
        >
            <TipTap bind:content={homework.content} />
        </div>
    </div>
    <footer class="flex gap-5 justify-end">
        <button class="btn secondary" onclick={oncancel}>Отменить</button>
        <button class="btn" onclick={() => validate() && onsave()}>
            {#if "id" in homework}Сохранить{:else}Создать{/if}
        </button>
    </footer>
</section>
