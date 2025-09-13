<script lang="ts">
    import type { Course, Homework, Submission } from "$lib/types";
    import type { User } from "itam-edu-common";
    import { coursePath } from "$lib/path.js";
    import { format as formatDate } from "date-fns";
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import RichContent from "$lib/components/editor/RichContent.svelte";
    import RichEditor from "$lib/components/editor/RichEditor.svelte";

    const { user, course, homework, submission }: Props = $props();
    type Props = {
        user: User | null;
        course: Course;
        homework: Homework;
        submission: Submission | null;
    };

    let content: string = $state("");

    async function submit() {
        if (!user) return;
        const response = await api({ fetch })
            .courses({ course: course.id })
            .homeworks({
                homework: homework.id
            })
            .submissions.post({ content });
        if (response.error) {
            alert(response.error.status);
            return;
        }
        content = "";
        await invalidate("app:submission");
        await invalidate("app:submissions");
    }

    const doesAcceptSubmissions = $derived(
        homework.deadlineOverride === null
            ? homework.deadline
                ? Date.now() < homework.deadline.getTime()
                : true
            : homework.deadlineOverride
    );
    const isWaitingReview = $derived(
        submission &&
            submission.attempts[0] &&
            submission.attempts[0]!.review === null
    );
    const canSubmit = $derived(
        course.permissions.submissions.create &&
            doesAcceptSubmissions &&
            !isWaitingReview
    );
</script>

<section class="relative flex flex-col gap-10 p-6 rounded-xl bg-surface shadow">
    <section class="flex flex-col">
        <header class="flex flex-col gap-2">
            <header class="flex items-center gap-3">
                <h2>{homework.title}</h2>
                {#if !doesAcceptSubmissions}
                    <span
                        class={[
                            "py-2 px-3",
                            "text-sm-regular leading-[1]",
                            "text-on-surface bg-[#e5e5e5] rounded-xs"
                        ]}
                    >
                        Закрыто
                    </span>
                {/if}
            </header>
            <h5 class="text-on-surface-muted">
                {#if homework.deadline}
                    Дедлайн до
                    {formatDate(homework.deadline, "dd.MM.yyyy HH:mm")}
                {:else}
                    Без дедлайна
                {/if}
            </h5>
            <menu class="absolute top-5.5 right-6 flex gap-2">
                {#if course.permissions.submissions.view === true}
                    <a
                        class={[
                            "flex justify-center items-center w-11.5 h-11.5 bg-on-primary rounded-xs basis-11.5 shrink-0",
                            "border border-on-primary hover:border-primary transition-colors duration-100"
                        ]}
                        href={`${coursePath(course)}/homeworks/review?homework=${homework.id}`}
                        aria-label="Проверить сданные работы"
                        title="Проверить сданные работы"
                    >
                        <i class="ph ph-envelope-open text-primary text-[20px]"
                        ></i>
                    </a>
                {/if}
                {#if course.permissions.homeworks.edit === true}
                    <a
                        class={[
                            "flex justify-center items-center w-11.5 h-11.5 bg-on-primary rounded-xs basis-11.5 shrink-0",
                            "border border-on-primary hover:border-primary transition-colors duration-100"
                        ]}
                        href={`${coursePath(course)}/homeworks/${homework.id}/edit`}
                        aria-label="Редактировать"
                        title="Редактировать"
                    >
                        <i class="ph ph-pencil-simple text-primary text-[20px]"
                        ></i>
                    </a>
                {/if}
            </menu>
        </header>
        {#if homework.content}
            <article class="mt-4">
                <RichContent content={homework.content} />
            </article>
        {/if}
        {#if homework.lessons.length > 0}
            <footer class="flex gap-3 mt-6">
                {#each homework.lessons as lesson}
                    <a
                        class={[
                            "flex items-center gap-2.5 w-min h-10 px-5 text-nowrap",
                            "text-primary text-md-medium bg-on-primary rounded-2xs",
                            "border border-on-primary hover:border-primary transition-colors duration-100"
                        ]}
                        href="{coursePath(course)}/lessons/{lesson.id}"
                        target="_blank"
                    >
                        {lesson.title}
                        <i class="ph ph-arrow-square-out text-[18px]"></i>
                    </a>
                {/each}
            </footer>
        {/if}
    </section>
    {#if canSubmit}
        <section class="flex flex-col gap-4">
            <div class="flex min-h-[240px] max-h-[600px]">
                <RichEditor
                    bind:content
                    characterLimit={10000}
                    features={{
                        formating: true,
                        codeBlocks: true,
                        links: true,
                        tables: false
                    }}
                />
            </div>
            <menu class="flex justify-end gap-2.5">
                <button
                    class="btn secondary"
                    onclick={() => {
                        alert("Sorry, not implemented yet!");
                    }}
                >
                    Добавить файл
                    <i class="ph ph-plus text-[18px]"></i>
                </button>
                <button class="btn" onclick={() => submit()}>
                    Отправить
                    <i class="ph ph-paper-plane-right text-[21px]"></i>
                </button>
            </menu>
        </section>
    {/if}
</section>
