<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import type { Course, HomeworkPartial } from "$lib/types";
    import { format as formatDate } from "date-fns";
    import { SvelteSet } from "svelte/reactivity";
    import { sortable } from "$lib/actions/sortable.svelte";
    import { coursePath } from "$lib/path";
    import ReorderableCard from "$lib/components/ReorderableCard.svelte";

    let { course, homeworks = $bindable(), onclose }: Props = $props();

    type Props = {
        course: Course;
        homeworks: HomeworkPartial[];
        onclose?: () => void;
    };

    let orderedIds = $state(homeworks.map(h => h.id));
    let deleted: SvelteSet<string> = $state(new SvelteSet());

    async function save() {
        const result = await api({ fetch })
            .courses({ course: course.id })
            .homeworks.put({
                homeworks: orderedIds.filter(id => !deleted.has(id))
            });

        if (result.status === 200) {
            await invalidate("app:homeworks");
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
            <h2 class="self-start">Домашние задания</h2>
        </header>
        <ul
            class="flex flex-col gap-5 overflow-y-auto"
            use:sortable={{ handle: ".dnd-handle", animation: 200 }}
            onsortchanged={e => (orderedIds = e.detail.sortable.toArray())}
        >
            {#each homeworks as homework}
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
