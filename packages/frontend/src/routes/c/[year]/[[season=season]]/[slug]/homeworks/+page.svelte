<script lang="ts">
    import Tag, { type TagKind } from "$lib/components/Tag.svelte";
    import { coursePath } from "$lib/path.js";
    import { format as formatDate } from "date-fns";

    let { data } = $props();

    const getTagKind = (homeworkId: string): TagKind => {
        const homeworkSubmissions = data.submissions.filter(
            submission => submission.homework === homeworkId
        );
        const submission = homeworkSubmissions.at(-1);
        if (!submission) return "new";
        if (!submission.review) return "submitted";
        return submission.review.accepted ? "accepted" : "rejected";
    };
</script>

<div class="flex flex-col gap-10 p-10">
    <header class="flex">
        <h2>Домашние задания</h2>
    </header>
    <div class="flex flex-col gap-2.5">
        {#each data.homeworks as homework}
            <a
                class="flex justify-between p-5 bg-surface rounded-xs shadow"
                href={`${coursePath(data.course)}/homeworks/${homework.id}`}
            >
                <div class="flex flex-col gap-3">
                    <header class="flex items-center gap-3">
                        <h4>{homework.title}</h4>
                        <Tag kind={getTagKind(homework.id)} />
                    </header>
                    <p class="text-on-surface-contrast opacity-50">
                        {#if homework.deadline}
                            <span>До</span>
                            <span>
                                {formatDate(
                                    homework.deadline,
                                    "dd.MM.yy / HH:mm"
                                )}
                            </span>
                        {:else}
                            Без дедлайна
                        {/if}
                    </p>
                </div>
                <i class="ph ph-caret-right text-[26px] self-center"></i>
            </a>
        {/each}
    </div>
</div>
