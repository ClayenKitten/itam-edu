<script lang="ts">
    import { coursePath } from "$lib/path";
    import EnrollSuggestion from "../../EnrollSuggestion.svelte";
    import HomeworkInfoSection from "./HomeworkInfoSection.svelte";
    import SubmissionAttempt from "./SubmissionAttempt.svelte";

    let { data } = $props();
</script>

<div
    class={[
        "flex flex-col h-full m-10 gap-7",
        "max-w-[1000px] @min-[1200px]/main:mx-40"
    ]}
>
    <div class="flex flex-col gap-5">
        <a
            class="group self-start flex items-center h-min gap-2 text-primary"
            href="{coursePath(data.course)}/homeworks"
        >
            <i class="ph ph-caret-left text-[20px]"></i>
            <h5 class="group-hover:underline">К списку заданий</h5>
        </a>
        <HomeworkInfoSection
            user={data.user}
            course={data.course}
            homework={data.homework}
            submission={data.submission}
        />
    </div>
    {#if data.submission}
        <ol class="flex flex-col gap-5">
            {#each data.submission.attempts as attempt, i (attempt.id)}
                <SubmissionAttempt {attempt} open={i === 0} />
            {/each}
        </ol>
    {/if}
</div>
{#if data.course.isEnrollmentOpen && data.course.role === null}
    <EnrollSuggestion
        text="Поступи на курс, чтобы сдавать задания на проверку преподавателям"
        user={data.user}
        course={data.course}
    />
{/if}
