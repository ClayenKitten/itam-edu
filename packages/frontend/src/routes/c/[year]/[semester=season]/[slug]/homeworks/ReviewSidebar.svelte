<script lang="ts">
    import { page } from "$app/state";
    import Combobox from "$lib/components/Combobox.svelte";
    import { coursePath, filePath } from "$lib/path";
    import type {
        Course,
        HomeworkPartial,
        Student,
        Submission
    } from "$lib/types";
    import type { SubmissionPartial } from "$lib/types";
    import { search } from "$lib/utils/search";

    const { course, submissions, students, selectedSubmission }: Props =
        $props();
    type Props = {
        course: Course;
        submissions: SubmissionPartial[];
        students: Student[];
        selectedSubmission: Submission | null;
    };

    let query = $state("");
    let filter: Student | HomeworkPartial | null = $state(null);
    let onlyNew = $state(false);

    let filteredSubmissions = $derived(
        submissions.filter(submission => {
            if (onlyNew && submission.accepted !== null) return false;
            if (
                filter &&
                filter.id !== submission.homework.id &&
                filter.id !== submission.student.id
            ) {
                return false;
            }
            return true;
        })
    );

    $effect(() => {
        const studentId = page.url.searchParams.get("student");
        const homeworkId = page.url.searchParams.get("homework");
        if (studentId) {
            filter = students.find(s => s.id === studentId) ?? null;
        } else if (homeworkId) {
            filter = course.homeworks.find(s => s.id === homeworkId) ?? null;
        }
    });
</script>

<aside
    class={[
        "w-[269px] h-[calc(100dvh-56px)] ml-auto",
        "flex flex-col bg-surface border-l border-surface-border"
    ]}
>
    <header class="flex gap-1 p-2.5 border-b border-surface-border">
        <Combobox
            bind:query
            bind:value={filter}
            suggestions={search(query, [...course.homeworks, ...students])}
            placeholder="Поиск..."
            alignRight
        >
            {#snippet selected(item)}
                <div
                    class={[
                        "flex items-center gap-1.5 w-full h-11 px-2.5",
                        "bg-surface text-md-regular outline-0",
                        "overflow-hidden text-nowrap overflow-ellipsis"
                    ]}
                >
                    {@render common(item)}
                </div>
            {/snippet}
            {#snippet suggestion(item, { highlighted })}
                <div
                    class={[
                        "flex items-center gap-1.5 w-full h-11 px-2.5",
                        "text-md-regular text-nowrap overflow-ellipsis outline-0",
                        highlighted ? "bg-on-primary" : "bg-surface",
                        "hover:bg-on-primary focus:bg-on-primary"
                    ]}
                >
                    {@render common(item)}
                </div>
            {/snippet}
            {#snippet empty()}
                <span
                    class={[
                        "flex items-center gap-1.5 h-11 px-2.5",
                        "bg-surface text-md-regular text-on-surface-muted ITALIC"
                    ]}
                >
                    Не найдено
                </span>
            {/snippet}
        </Combobox>
        <label
            class={[
                "shrink-0 size-11 flex justify-center items-center rounded-2xs",
                onlyNew
                    ? "text-on-primary bg-primary"
                    : "text-primary bg-on-primary",
                "transition-colors duration-200"
            ]}
            aria-label="Показывать только непроверенные"
            title="Показывать только непроверенные"
        >
            <input class="hidden" type="checkbox" bind:checked={onlyNew} />
            <i class="ph ph-clock-user text-[20px]"></i>
        </label>
    </header>
    <ul class="flex flex-col overflow-y-auto">
        {#each filteredSubmissions as submission}
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
                    class={[
                        "flex justify-between items-center p-2.5",
                        "text-md-regular bg-surface-tint overflow-hidden text-ellipsis rounded-2xs"
                    ]}
                >
                    {submission.homework.title}
                    {#if submission.accepted === null}
                        <div
                            class="ml-auto size-2 bg-primary rounded-full"
                        ></div>
                    {/if}
                </div>
            </a>
        {:else}
            <div
                class="mt-12 text-center text-lg-regular text-on-surface-muted"
            >
                Ничего не нашлось ❤️‍🩹
            </div>
        {/each}
    </ul>
</aside>

{#snippet common(item: Student | HomeworkPartial)}
    {#if "avatar" in item}
        <div
            class="cover size-[24px] text-sm-regular rounded-2xs"
            style:background-image={item.avatar
                ? `url(${filePath(item.avatar)})`
                : null}
        >
            <span>{item.tgUsername[0]}</span>
        </div>
    {:else}
        <div
            class={[
                "shrink-0 size-[24px] flex justify-center items-center",
                "text-primary bg-on-primary text-sm-regular rounded-2xs"
            ]}
        >
            <i class="ph ph-book-open-text"></i>
        </div>
    {/if}
    <span class="text-nowrap overflow-hidden overflow-ellipsis">
        {#if "tgUsername" in item}
            <span class="text-md-regular">
                {[item.firstName, item.lastName].filter(n => n).join(" ")},
            </span>
            <span class="text-on-surface-muted">@{item.tgUsername}</span>
        {:else}
            <span class="text-md-regular">{item.title}</span>
        {/if}
    </span>
{/snippet}
