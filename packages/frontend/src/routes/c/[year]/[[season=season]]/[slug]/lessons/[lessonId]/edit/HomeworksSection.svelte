<script lang="ts">
    import { coursePath } from "$lib/path";
    import type { Course, Lesson } from "$lib/types";
    import { format as formatDate } from "date-fns";
    import { SvelteSet } from "svelte/reactivity";
    import ReorderableCard from "$lib/components/ReorderableCard.svelte";
    import { sortable } from "$lib/actions/sortable.svelte";

    let {
        course,
        homeworks,
        modifiedHomeworks = $bindable()
    }: Props = $props();

    type Props = {
        course: Course;
        homeworks: Lesson["homeworks"];
        modifiedHomeworks: string[];
    };

    let sorted: string[] = $state(homeworks.map(h => h.id));
    let deleted: SvelteSet<string> = new SvelteSet();
    $effect(() => {
        modifiedHomeworks = sorted.filter(id => !deleted.has(id));
    });
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <header class="flex flex-col gap-2">
        <h3>Задания</h3>
        <p class="max-w-[800px] text-balance">
            К уроку могут быть прикреплены задания для выполнения студентами.
            Одно и то же задание может быть прикреплено к нескольким урокам.
        </p>
    </header>
    {#if homeworks.length > 0}
        <ul
            class="flex flex-col gap-5 w-full"
            use:sortable={{ handle: ".dnd-handle", animation: 200 }}
            onsortchanged={e => (sorted = e.detail.sortable.toArray())}
        >
            {#each homeworks as homework (homework.id)}
                <ReorderableCard
                    id={homework.id}
                    title={homework.title}
                    subtitle={homework.deadline
                        ? `До ${formatDate(homework.deadline, "dd.MM.yy HH:mm")}`
                        : "Без дедлайна"}
                    href="{coursePath(course)}/homeworks/{homework.id}"
                    isDeleted={deleted.has(homework.id)}
                    onDelete={() => deleted.add(homework.id)}
                    onRecover={() => deleted.delete(homework.id)}
                />
            {/each}
        </ul>
    {/if}
    <button class="btn w-min">
        Добавить
        <i class="ph ph-plus text-[18px]"></i>
    </button>
</section>
