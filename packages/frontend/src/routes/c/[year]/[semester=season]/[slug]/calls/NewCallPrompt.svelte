<script lang="ts">
    import { type PromptProps } from "$lib/Prompter.svelte";
    import { onMount } from "svelte";
    import type { LessonPartial } from "$lib/types";
    import type { CallDto } from "itam-edu-api/src/calls/dao";

    const { lessons, calls, onConfirm, onCancel }: Props = $props();
    type Props = PromptProps<{ title: string } | { lessonId: string }> & {
        lessons: LessonPartial[];
        calls: CallDto[];
    };

    let dialog: HTMLDialogElement;
    onMount(() => {
        dialog.showModal();
    });

    const filteredLesson = $derived(
        lessons.filter(
            l =>
                l.schedule !== null &&
                l.schedule.isOnline !== false &&
                l.title.includes(lessonQuery) &&
                !calls.some(c => l.id === c.id)
        )
    );

    let title: string = $state("");
    let lesson: LessonPartial | null = $state(null);
    let lessonQuery: string = $state("");

    const minTitleLength = 3;
    const maxTitleLength = 50;

    const valid = $derived(
        (title.length >= minTitleLength && title.length <= maxTitleLength) ||
            lesson !== null
    );
</script>

<dialog
    class={[
        "modal overflow-visible",
        "hidden open:flex flex-col gap-5 w-150 px-10 pt-10 pb-12.5 m-auto text-on-surface bg-surface rounded-xl",
        "backdrop:bg-[black] backdrop:opacity-30"
    ]}
    onclose={() => onCancel()}
    bind:this={dialog}
>
    <header class="flex flex-col">
        <button
            class="self-end flex justify-center items-center h-8 w-8 border border-primary rounded-[8px]"
            aria-label="Закрыть"
            onclick={() => dialog.close()}
        >
            <i class="ph ph-x text-[12.5px]"></i>
        </button>
        <h2 class="self-center">Новый звонок</h2>
    </header>
    <div class="flex gap-4">
        {#if lesson === null}
            <div class="flex-1 flex flex-col gap-1">
                <input
                    class="input-small"
                    bind:value={title}
                    minlength={3}
                    maxlength={maxTitleLength}
                    required
                    placeholder="Введите название звонка"
                />
            </div>
        {/if}
        {#if title === "" && lesson === null}
            <span class="self-center text-sm-regular text-on-surface-muted">
                или
            </span>
        {/if}
        {#if title === ""}
            <div
                class={[
                    "flex-1 flex flex-col gap-1 transition-all duration-200",
                    "overflow-hidden",
                    title !== "" && "w-0"
                ]}
            >
                <select
                    class={[
                        "input-small overflow-ellipsis",
                        lesson === null && "text-on-surface-muted"
                    ]}
                    bind:value={lesson}
                >
                    <option value={null}>Выберите урок</option>
                    {#each filteredLesson as lesson}
                        <option value={lesson}>{lesson.title}</option>
                    {/each}
                </select>
            </div>
        {/if}
    </div>
    <button
        class="btn big"
        disabled={!valid}
        onclick={() => {
            if (lesson !== null) {
                onConfirm({ lessonId: lesson.id });
            } else if (title) {
                onConfirm({ title });
            }
        }}
    >
        Начать звонок
    </button>
</dialog>
