<script lang="ts">
    import { type PromptProps } from "$lib/Prompter.svelte";
    import { onMount } from "svelte";
    import type { LessonPartial } from "$lib/types";
    import Combobox from "$lib/components/Combobox.svelte";

    const { lessons, onConfirm, onCancel }: Props = $props();
    type Props = PromptProps<{ title: string } | { lessonId: string }> & {
        lessons: LessonPartial[];
    };

    let dialog: HTMLDialogElement;
    onMount(() => {
        dialog.showModal();
    });

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
                    title !== "" && "w-0"
                ]}
            >
                <Combobox
                    placeholder="Выберите урок"
                    bind:value={lesson}
                    bind:query={lessonQuery}
                    suggestions={lessons.filter(
                        l =>
                            l.schedule !== null && l.title.includes(lessonQuery)
                    )}
                >
                    {#snippet selected(l)}
                        <div
                            class={[
                                "flex items-center gap-1.5 w-full h-11 px-2.5",
                                "bg-surface text-md-regular text-nowrap overflow-ellipsis outline-0"
                            ]}
                        >
                            <span
                                class="text-md-regular text-nowrap overflow-ellipsis"
                            >
                                {l.title}
                            </span>
                            <button
                                class="ml-auto p-2 rounded-full hover:bg-surface-tint"
                                aria-label="Удалить"
                                onclick={() => (lesson = null)}
                            >
                                <i class="ph ph-x"></i>
                            </button>
                        </div>
                        {l.title}
                    {/snippet}
                    {#snippet suggestion(l)}
                        <div
                            class={[
                                "flex items-center gap-1.5 w-full h-11 px-2.5",
                                "bg-surface text-md-regular text-nowrap overflow-ellipsis outline-0"
                            ]}
                        >
                            {l.title}
                        </div>
                    {/snippet}
                    {#snippet empty()}
                        <div
                            class={[
                                "flex items-center gap-1.5 w-full px-2.5 py-4",
                                "bg-surface text-md-regular outline-0"
                            ]}
                        >
                            Пусто! Запланируйте хотя бы один урок.
                        </div>
                    {/snippet}
                </Combobox>
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
