<script lang="ts">
    import { coursePath } from "$lib/path";
    import type { Course, Lesson } from "$lib/types";
    import { format as formatDate } from "date-fns";
    import { SvelteSet } from "svelte/reactivity";
    import Sortable from "sortablejs";
    import { onMount } from "svelte";
    import ReorderableCard from "$lib/components/ReorderableCard.svelte";

    let {
        course,
        lesson = $bindable(),
        modifiedHomeworks = $bindable()
    }: Props = $props();

    type Props = {
        course: Course;
        lesson: Lesson;
        modifiedHomeworks: string[];
    };

    let deleted: SvelteSet<string> = new SvelteSet();

    let sortableList: HTMLUListElement | null = $state(null);
    let sortable: Sortable;

    onMount(() => {
        sortable = Sortable.create(sortableList!, {
            handle: ".dnd-handle",
            animation: 200,
            onUpdate: update
        });
    });

    const update = () => {
        modifiedHomeworks = sortable.toArray().filter(id => !deleted.has(id));
    };
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <header class="flex flex-col gap-2">
        <h3>Домашние задания</h3>
        <p class="max-w-[800px] text-balance">
            К занятию могут быть прикреплены домашние задания. Одно и то же
            задание может быть прикреплено к нескольким занятиям.
        </p>
    </header>
    {#if lesson.homeworks.length > 0}
        <ul class="flex flex-col gap-5 w-full" bind:this={sortableList}>
            {#each lesson.homeworks as homework (homework.id)}
                <ReorderableCard
                    id={homework.id}
                    title={homework.title}
                    subtitle={homework.deadline
                        ? `До ${formatDate(homework.deadline, "dd.MM.yy HH:mm")}`
                        : "Без дедлайна"}
                    href="{coursePath(course)}/homeworks/{homework.id}"
                    isDeleted={deleted.has(homework.id)}
                    onDelete={() => {
                        deleted.add(homework.id);
                        update();
                    }}
                    onRecover={() => {
                        deleted.delete(homework.id);
                        update();
                    }}
                />
            {/each}
        </ul>
    {/if}
    <button class="btn w-min">
        Добавить
        <i class="ph ph-plus text-[18px]"></i>
    </button>
</section>
