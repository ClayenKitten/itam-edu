<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import type { Course, LessonPartial } from "$lib/types";
    import { format as formatDate } from "date-fns";
    import { SvelteSet } from "svelte/reactivity";
    import Sortable from "sortablejs";
    import { onMount } from "svelte";
    import { coursePath } from "$lib/path";
    import ReorderableCard from "$lib/components/ReorderableCard.svelte";

    let { course, lessons = $bindable(), onclose }: Props = $props();

    type Props = {
        course: Course;
        lessons: LessonPartial[];
        onclose?: () => void;
    };

    let orderedIds = $state(lessons.map(l => l.id));
    let deleted: SvelteSet<string> = $state(new SvelteSet());

    let sortableList: HTMLUListElement;
    onMount(() => {
        const sortable = Sortable.create(sortableList, {
            handle: ".dnd-handle",
            animation: 200,
            onUpdate: () => (orderedIds = sortable.toArray())
        });
    });

    async function save() {
        const result = await api({ fetch })
            .courses({ course: course.id })
            .lessons.put({
                lessons: orderedIds.filter(id => !deleted.has(id))
            });

        if (result.status === 200) {
            await invalidate("app:lessons");
            onclose?.();
        } else {
            alert(result.status);
        }
    }
</script>

<div
    class="backdrop absolute inset-0 bg-[black] opacity-50"
    aria-hidden="true"
></div>
<div class="window absolute inset-0 flex justify-center items-center">
    <div
        class={[
            "w-150 max-h-150 flex flex-col px-10 pt-10 pb-12.5 gap-7.5",
            "text-on-surface bg-surface rounded-xl"
        ]}
    >
        <header class="flex flex-col">
            <h2 class="self-start">Занятия</h2>
        </header>
        <ul
            class="flex flex-col gap-5 overflow-y-auto"
            bind:this={sortableList}
        >
            {#each lessons as lesson}
                <ReorderableCard
                    id={lesson.id}
                    title={lesson.title}
                    subtitle={lesson.schedule
                        ? `${formatDate(lesson.schedule.date, "dd.MM.yy HH:mm")}`
                        : "Без даты"}
                    href="{coursePath(course)}/lessons/{lesson.id}"
                    isDeleted={deleted.has(lesson.id)}
                    onDelete={() => deleted.add(lesson.id)}
                    onRecover={() => deleted.delete(lesson.id)}
                />
            {/each}
        </ul>
        <footer class="flex gap-5 text-comment">
            <button
                class="grow-1 h-17 btn text-comment bg-on-primary text-primary"
                onclick={onclose}
            >
                Отменить
            </button>
            <button class="grow-1 h-17 btn text-comment" onclick={save}>
                Сохранить
            </button>
        </footer>
    </div>
</div>
