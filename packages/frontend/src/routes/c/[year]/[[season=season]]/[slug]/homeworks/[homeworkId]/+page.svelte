<script lang="ts">
    import HomeworkInfoSection from "./HomeworkInfoSection.svelte";
    import SubmissionAttempt from "./SubmissionAttempt.svelte";

    let { data } = $props();
</script>

<div class="flex flex-col h-full m-10 gap-7 max-w-[1000px]">
    <HomeworkInfoSection
        user={data.user}
        course={data.course}
        homework={data.homework}
        submission={data.submission}
    />
    {#if data.submission}
        <ol class="flex flex-col gap-5">
            {#each data.submission.attempts as attempt, i (attempt.id)}
                <SubmissionAttempt {attempt} open={i === 0} />
            {/each}
        </ol>
    {/if}
</div>
