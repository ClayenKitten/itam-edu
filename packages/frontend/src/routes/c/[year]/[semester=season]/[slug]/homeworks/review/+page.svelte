<!--
    Note: this page is only displayed if no submissions exist (after filtering).
    Check adjacent page.ts for more details.
-->

<script lang="ts">
    import { page } from "$app/state";
    import ReviewSidebar from "../ReviewSidebar.svelte";

    let { data } = $props();
</script>

<div class="flex">
    <div class="flex-1 max-h-[calc(100dvh-56px)] overflow-y-auto">
        <div class="flex flex-col mt-[25dvh] items-center gap-2">
            <h4 class="text-on-surface-contrast">
                {#if page.url.searchParams.has("student")}
                    Студент не сдал ни одно задание 😥
                {:else if page.url.searchParams.has("homework")}
                    Никто не сдал задание 😥
                {:else}
                    Сданных работ ещё нет 😥
                {/if}
            </h4>
            <span class="text-lg-regular text-on-surface-muted">
                Но это (возможно) не навсегда! Вам придёт уведомление при
                поступлении новых ответов.
            </span>
        </div>
    </div>
    <ReviewSidebar
        course={data.course}
        submissions={data.submissions}
        selectedSubmission={null}
        students={data.students}
    />
</div>
