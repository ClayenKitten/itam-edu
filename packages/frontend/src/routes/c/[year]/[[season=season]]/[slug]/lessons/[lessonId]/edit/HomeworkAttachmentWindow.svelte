<script lang="ts">
    import type { Course } from "$lib/types";
    import { formatDate } from "date-fns";

    export function show() {
        dialog.showModal();
    }

    function addHomework(id: string) {
        onHomeworkAdded(id);
        dialog.close();
    }

    let dialog: HTMLDialogElement;
    let { course, addedHomeworks, onHomeworkAdded }: Props = $props();

    type Props = {
        course: Course;
        addedHomeworks: string[];
        onHomeworkAdded: (id: string) => void;
    };
</script>

<dialog
    class={[
        "modal",
        "hidden open:flex flex-col gap-5 w-150 px-10 pt-10 pb-12.5 m-auto text-on-surface bg-surface rounded-xl",
        "backdrop:bg-[black] backdrop:opacity-30"
    ]}
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
        <h4>Прикрепление задания</h4>
    </header>

    <ul class="flex flex-col gap-2.5">
        {#each course.homeworks as homework (homework.id)}
            {#if !addedHomeworks.includes(homework.id)}
                <button
                    onclick={() => addHomework(homework.id)}
                    class="flex grow items-center justify-between p-5 shadow rounded-xs"
                >
                    <div class="flex flex-col gap-3 items-start">
                        <header>
                            <h5>{homework.title}</h5>
                        </header>
                        <p
                            class="text-md-regular text-on-surface-contrast opacity-50"
                        >
                            {#if homework.deadline}
                                <span>Дедлайн до</span>
                                <span>
                                    {formatDate(
                                        homework.deadline,
                                        "dd.MM.yy HH:mm"
                                    )}
                                </span>
                            {:else}
                                Без дедлайна
                            {/if}
                        </p>
                    </div>
                    <i class="ph ph-caret-right text-[26px] self-center"></i>
                </button>
            {/if}
        {/each}
    </ul>
</dialog>
