<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import type { Course, HomeworkPartial } from "$lib/types";
    import { format as formatDate } from "date-fns";
    import { SvelteSet } from "svelte/reactivity";
    import { sortable } from "$lib/actions/sortable.svelte";
    import { coursePath } from "$lib/path";
    import ReorderableCard from "$lib/components/ReorderableCard.svelte";

    let { course, homeworks = $bindable() }: Props = $props();

    type Props = {
        course: Course;
        homeworks: HomeworkPartial[];
    };

    export function show() {
        dialog.showModal();
    }
    let dialog: HTMLDialogElement;

    let orderedIds = $state(homeworks.map(h => h.id));
    let deleted = $state(new SvelteSet<string>());

    async function save() {
        const result = await api({ fetch })
            .courses({ course: course.id })
            .homeworks.put({
                homeworks: orderedIds.filter(id => !deleted.has(id))
            });

        if (result.status === 200) {
            await invalidate("app:homeworks");
            close();
        } else {
            alert(result.status);
        }
    }
    function close() {
        orderedIds = homeworks.map(h => h.id);
        deleted = new SvelteSet();
        dialog.close();
    }
</script>

<dialog
    class={[
        "modal",
        "hidden open:flex flex-col gap-7.5 w-150 max-h-150 px-10 pt-10 pb-12.5 m-auto",
        "text-on-surface bg-surface rounded-xl",
        "backdrop:bg-[black] backdrop:opacity-30"
    ]}
    bind:this={dialog}
>
    <header class="flex flex-col">
        <h2 class="self-start">Задания</h2>
    </header>
    <ul
        class="flex flex-col gap-5 overflow-y-auto"
        use:sortable={{ handle: ".dnd-handle", animation: 200 }}
        onsortchanged={e => (orderedIds = e.detail.sortable.toArray())}
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
    <footer class="flex gap-5 text-comment">
        <button
            class="grow-1 h-17 btn text-comment bg-on-primary text-primary"
            onclick={close}
        >
            Отменить
        </button>
        <button class="grow-1 h-17 btn text-comment" onclick={save}>
            Сохранить
        </button>
    </footer>
</dialog>
