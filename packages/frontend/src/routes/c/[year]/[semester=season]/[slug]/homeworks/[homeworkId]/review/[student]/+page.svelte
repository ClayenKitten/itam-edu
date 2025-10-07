<script lang="ts">
    import HomeworkInfoSection from "../../HomeworkInfoSection.svelte";
    import ReviewSidebar from "../../../ReviewSidebar.svelte";
    import ReviewSection from "./ReviewSection.svelte";
    import SubmissionAttempt from "../../SubmissionAttempt.svelte";

    let { data } = $props();

    const isUnreviewed = $derived(data.submission.attempts[0].review === null);
    const displayAttempts = $derived(
        isUnreviewed
            ? data.submission.attempts.slice(1)
            : data.submission.attempts
    );
</script>

<div class="flex">
    <div class="flex-1 max-h-[calc(100dvh-56px)] overflow-y-auto">
        <div class="flex flex-col gap-6 m-10 max-w-[1000px]">
            <HomeworkInfoSection
                user={data.user}
                course={data.course}
                homework={data.homework}
                submission={data.submission}
            />
            <ReviewSection
                user={data.user}
                course={data.course}
                homework={data.homework}
                submission={data.submission}
            />
            <ol class="flex flex-col gap-5">
                {#each displayAttempts as attempt, i (attempt.id)}
                    <SubmissionAttempt {attempt} open={i === 0} />
                {/each}
            </ol>
        </div>
    </div>
    <ReviewSidebar
        course={data.course}
        submissions={data.submissions}
        students={data.students}
        selectedSubmission={data.submission}
    />
</div>
