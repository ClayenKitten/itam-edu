<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import { coursePath } from "$lib/path";
    import type { Course, LessonPartial } from "$lib/types";
    import { format as formatDate } from "date-fns";
    import { SvelteSet } from "svelte/reactivity";

    let { course, lessons = $bindable(), onclose }: Props = $props();

    type Props = {
        course: Course;
        lessons: LessonPartial[];
        onclose?: () => void;
    };

    let tempLessons = $state(structuredClone(lessons));
    let deleted: SvelteSet<string> = $state(new SvelteSet());

    async function save() {
        const result = await api({ fetch })
            .courses({ course: course.id })
            .lessons.put({
                lessons: tempLessons
                    .map(l => l.id)
                    .filter(id => !deleted.has(id))
            });

        if (result.status === 200) {
            await invalidate("app:lessons");
            onclose?.();
        } else {
            alert(result.status);
        }
    }

    const toggleRemove = (id: string) => {
        if (deleted.has(id)) deleted.delete(id);
        else deleted.add(id);
    };
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
        <ul class="flex flex-col gap-5 overflow-y-auto">
            {#each tempLessons as lesson}
                <li class="flex items-center w-full gap-1 group">
                    <div class="flex items-center justify-center w-7.5 h-7.5">
                        <i class="ph ph-dots-six-vertical text-[19px]"></i>
                    </div>
                    <div
                        class={[
                            "flex grow items-center justify-between px-5 py-4",
                            !deleted.has(lesson.id)
                                ? "bg-surface group-hover:bg-on-primary border border-primary"
                                : "bg-[#E9E9E9] border border-on-surface-muted",
                            "transition-colors duration-100 rounded-sm"
                        ]}
                    >
                        <div class="flex flex-col gap-2">
                            <span class="text-comment">{lesson.title}</span>
                            <span class="text-date">
                                {#if lesson.schedule}
                                    {formatDate(
                                        lesson.schedule.date,
                                        "dd.MM.yy HH:mm"
                                    )}
                                {:else}
                                    Без даты
                                {/if}
                            </span>
                        </div>
                        <button
                            class={[
                                "flex justify-center items-center w-9 h-9 border",
                                "text-on-surface-muted border-on-surface-muted rounded-2xs",
                                !deleted.has(lesson.id)
                                    ? "group-hover:text-primary group-hover:border-primary"
                                    : "",
                                "hover:bg-surface"
                            ]}
                            aria-label="Удалить"
                            onclick={() => toggleRemove(lesson.id)}
                        >
                            <i
                                class="ph ph-{!deleted.has(lesson.id)
                                    ? 'trash'
                                    : 'arrow-counter-clockwise'} text-[20px]"
                            ></i>
                        </button>
                    </div>
                </li>
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
