<script lang="ts">
    import type { Submission } from "$lib/types";
    import { format as formatDate } from "date-fns";
    import Tag from "$lib/components/Tag.svelte";
    import RichEditor from "$lib/components/editor/RichEditor.svelte";
    import RichContent from "$lib/components/editor/RichContent.svelte";

    const { attempt, open = false }: Props = $props();
    type Props = {
        attempt: Submission["attempts"][number];
        open?: boolean;
    };
</script>

<details class="group flex flex-col bg-surface shadow rounded-lg" {open}>
    <summary class="h-7.5 m-6 flex items-center gap-3 cursor-pointer">
        <h4>
            Попытка от {formatDate(attempt.sentAt, "dd.MM HH:mm")}
        </h4>
        <div>
            {#if attempt.review?.accepted === true}
                <Tag kind="accepted" />
            {:else if attempt.review?.accepted === false}
                <Tag kind="rejected" />
            {:else}
                <Tag kind="submitted" />
            {/if}
        </div>
        <div
            class={[
                "size-10 ml-auto",
                "flex justify-center items-center",
                "rounded-2xs hover:bg-surface-tint cursor-pointer",
                "transition-colors duration-100"
            ]}
        >
            <i class="ph ph-caret-up text-[20px] not-group-open:hidden"></i>
            <i class="ph ph-caret-down text-[20px] group-open:hidden"></i>
        </div>
    </summary>
    <div class="flex flex-col gap-6 p-6 pt-0">
        <section>
            <RichContent content={attempt.content} />
        </section>
        {#if attempt.review && attempt.review.content}
            <hr class="border-surface-border" />
            <section class="flex flex-col gap-4">
                <h4>Комментарий от проверяющего</h4>
                <RichContent content={attempt.review.content} />
            </section>
        {/if}
    </div>
</details>
