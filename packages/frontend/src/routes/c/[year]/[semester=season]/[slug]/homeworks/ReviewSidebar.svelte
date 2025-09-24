<script lang="ts">
    import { coursePath, filePath } from "$lib/path";
    import type { Course, Submission } from "$lib/types";
    import type { SubmissionPartial } from "$lib/types";

    const { course, submissions, selectedSubmission }: Props = $props();
    type Props = {
        course: Course;
        submissions: SubmissionPartial[];
        selectedSubmission: Submission | null;
    };

    let search = $state("");
</script>

<aside
    class={[
        "w-[269px] h-[calc(100dvh-56px)] overflow-y-auto ml-auto",
        "flex flex-col bg-surface border-l border-surface-border"
    ]}
>
    <header class="flex gap-1 px-2.5 py-5 border-b border-surface-border">
        <input
            class={[
                "flex-1 h-7.5 px-2.5",
                "bg-surface-tint text-on-surface text-sm-regular",
                "border border-surface-border rounded-2xs"
            ]}
            placeholder="Поиск..."
            bind:value={search}
        />
        <button
            class="shrink-0 size-7.5 text-on-primary text-[14px] bg-primary rounded-2xs"
            aria-label="Фильтры"
            title="Фильтры"
        >
            <i class="ph ph-sliders-horizontal"></i>
        </button>
    </header>
    {#each submissions as submission}
        {@const isSelected =
            selectedSubmission?.homework.id === submission.homework.id &&
            selectedSubmission?.student.id === submission.student.id}
        <a
            class={[
                "flex flex-col gap-2 px-2.5 py-5 border-b border-surface-border",
                isSelected ? "bg-on-primary" : ""
            ]}
            href={`${coursePath(course)}/homeworks/${submission.homework.id}/review/${submission.student.id}`}
        >
            <div class="flex gap-2">
                <div
                    class={[
                        "size-[36px] shrink-0 flex justify-center items-center",
                        "bg-cover bg-center bg-primary rounded-2xs"
                    ]}
                    style:background-image={submission.student.avatar
                        ? `url(${filePath(submission.student.avatar)})`
                        : null}
                >
                    {#if !submission.student.avatar}
                        <span class="text-on-primary text-sm-regular">
                            {submission.student.tgUsername[0]}
                        </span>
                    {/if}
                </div>
                <div class="flex flex-col">
                    <span class="text-md-regular text-on-surface">
                        {submission.student.firstName}
                        {submission.student.lastName}
                    </span>
                    <span class="text-sm-regular text-on-surface-muted">
                        @{submission.student.tgUsername}
                    </span>
                </div>
            </div>
            <div
                class="p-2.5 text-md-regular bg-surface-tint overflow-hidden text-ellipsis rounded-2xs"
            >
                {submission.homework.title}
            </div>
        </a>
    {/each}
</aside>
