<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import type { Course, LessonPartial } from "$lib/types";
    import { format as formatDate } from "date-fns";
    import { SvelteSet } from "svelte/reactivity";
    import { sortable } from "$lib/actions/sortable.svelte";
    import { coursePath } from "$lib/path";
    import ReorderableCard from "$lib/components/ReorderableCard.svelte";

    let { course, lessons = $bindable() }: Props = $props();

    type Props = {
        course: Course;
        lessons: LessonPartial[];
    };

    export function show() {
        dialog.showModal();
    }
    let dialog: HTMLDialogElement;

    let orderedIds = $state(lessons.map(l => l.id));
    let deleted = $state(new SvelteSet<string>());

    async function save() {
        const result = await api({ fetch })
            .courses({ course: course.id })
            .lessons.put({
                lessons: orderedIds.filter(id => !deleted.has(id))
            });

        if (result.status === 200) {
            await invalidate("app:lessons");
            close();
        } else {
            alert(result.status);
        }
    }
    function close() {
        orderedIds = lessons.map(l => l.id);
        deleted = new SvelteSet<string>();
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
        <h2 class="self-start">Уроки</h2>
    </header>
    <ul
        class="flex flex-col gap-5 overflow-y-auto"
        use:sortable={{ handle: ".dnd-handle", animation: 200 }}
        onsortchanged={e => (orderedIds = e.detail.sortable.toArray())}
    >
        {#key lessons}
            {#each lessons as lesson (lesson.id)}
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
        {/key}
    </ul>
    <footer class="flex gap-5 text-comment">
        <button class="grow-1 h-17 btn secondary text-comment" onclick={close}>
            Отменить
        </button>
        <button class="grow-1 h-17 btn text-comment" onclick={save}>
            Сохранить
        </button>
    </footer>
</dialog>
