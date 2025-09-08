<script lang="ts">
    import type { Course, Homework, Submission } from "$lib/types";
    import { userFilePath, type User } from "itam-edu-common";
    import TipTap from "$lib/components/TipTap.svelte";
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";

    const { course, homework, submission }: Props = $props();
    type Props = {
        user: User | null;
        course: Course;
        homework: Homework;
        submission: Submission;
    };

    let content: string = $state("");
    const isUnreviewed = $derived(submission.attempts[0].review === null);

    async function review(accepted: boolean) {
        const response = await api({ fetch })
            .courses({ course: course.id })
            .homeworks({ homework: homework.id })
            .submissions({ student: submission.student.id })
            .review.post({
                content,
                accepted
            });
        if (response.error) {
            alert(response.error.status);
            return;
        }
        await invalidate("app:submission");
        await invalidate("app:submissions");
    }
</script>

<section class="relative flex flex-col gap-6 p-6 rounded-xl bg-surface shadow">
    <header class="flex gap-2.5">
        <div
            class={[
                "size-[50px] shrink-0 flex justify-center items-center",
                "bg-cover bg-center bg-primary rounded-sm"
            ]}
            style:background-image={submission.student.avatar
                ? `url(${userFilePath(submission.student.id).avatar(submission.student.avatar)})`
                : null}
        >
            {#if !submission.student.avatar}
                <span class="text-on-primary text-sm-regular">
                    {submission.student.tgUsername[0]}
                </span>
            {/if}
        </div>
        <div class="flex flex-col gap-1">
            <h4>
                {submission.student.firstName}
                {submission.student.lastName}
            </h4>
            <a
                class="text-md-regular text-primary hover:underline"
                target="_blank"
                href={`https://t.me/${submission.student.tgUsername}`}
            >
                @{submission.student.tgUsername}
            </a>
        </div>
    </header>
    {#if isUnreviewed}
        <article>
            <TipTap content={submission.attempts[0].content} readonly />
        </article>
        <hr class="border-surface-border" />
        <section class="flex flex-col gap-4">
            <h5>Комментарий от проверяющего</h5>
            <div
                class={[
                    "h-full min-h-[180px] p-5 border-2 rounded-sm",
                    "border-primary-border focus-within:border-primary"
                ]}
            >
                <TipTap bind:content />
            </div>
        </section>
        <menu class="flex justify-end gap-2.5">
            <button
                class="btn secondary text-md-medium"
                onclick={() => review(false)}
            >
                <i class="ph ph-x text-[21px]"></i>
                Отклонить
            </button>
            <button class="btn text-md-medium" onclick={() => review(true)}>
                <i class="ph ph-check text-[21px]"></i>
                Принять
            </button>
        </menu>
    {/if}
</section>
