<!--
    Note: this page is only displayed if no submissions exist.
    Check adjacent page.ts for more details.
-->

<script lang="ts">
    import ReviewSidebar from "../ReviewSidebar.svelte";

    let { data } = $props();
</script>

<div class="flex">
    <div class="flex-1 max-h-[calc(100dvh-56px)] overflow-y-auto">
        <div class="flex flex-col mt-[25dvh] items-center gap-2">
            <h4 class="text-on-surface-contrast">Сданных работ ещё нет 😥</h4>
            <span class="text-lg-regular text-on-surface-muted">
                Возвращайтесь, когда студент загрузит решение к какому-нибудь
                заданию.
            </span>
        </div>
    </div>
    <ReviewSidebar
        course={data.course}
        submissions={data.submissions}
        selectedSubmission={null}
    />
</div>
