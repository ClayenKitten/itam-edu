<script lang="ts">
    import type { Course, Homework, Submission } from "$lib/types";
    import type { User } from "itam-edu-common";
    import { coursePath } from "$lib/path.js";
    import { format as formatDate } from "date-fns";
    import { invalidateAll } from "$app/navigation";
    import api from "$lib/api";
    import RichContent from "$lib/components/editor/RichContent.svelte";
    import RichEditor from "$lib/components/editor/RichEditor.svelte";
    import { getToaster } from "$lib/Toaster.svelte";
    import FileItem from "$lib/components/FileItem.svelte";

    const { user, course, homework, submission }: Props = $props();
    type Props = {
        user: User | null;
        course: Course;
        homework: Homework;
        submission: Submission | null;
    };
    const toaster = getToaster();

    let content: string = $state("");
    let attachments: File[] = $state([]);

    async function submit() {
        if (!user) return;
        const response = await api({ fetch })
            .courses({ course: course.id })
            .homeworks({
                homework: homework.id
            })
            .submissions.post({ content, attachments });
        if (response.error) {
            alert(response.error.status);
            return;
        }
        content = "";
        await invalidateAll();
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
    <article class="flex flex-col gap-2">
        <header class="flex items-center gap-3">
            <h2 class="flex-1 wrap-anywhere">
                {homework.title}
                {#if !doesAcceptSubmissions}
                    <span
                        class={[
                            "self-start py-2 px-3 align-middle",
                            "text-sm-regular text-on-surface bg-[#e5e5e5] rounded-xs"
                        ]}
                    >
                        Закрыто
                    </span>
                {/if}
            </h2>
            <menu class="shrink-0 self-start flex gap-2">
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
        <h5 class="text-on-surface-muted">
            {#if homework.deadline}
                Дедлайн {formatDate(homework.deadline, "dd.MM.yyyy в HH:mm")}
            {:else}
                Без дедлайна
            {/if}
        </h5>
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
    </article>
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
            {#if attachments.length > 0}
                <ul class="flex flex-wrap gap-2.5">
                    {#each attachments as attachment}
                        <FileItem
                            file={attachment}
                            onDelete={() => {
                                attachments = attachments.filter(
                                    a => a !== attachment
                                );
                            }}
                        />
                    {/each}
                </ul>
            {/if}
            <menu class="flex justify-end gap-2.5">
                {#if attachments.length < 3}
                    <label
                        class="btn secondary"
                        title="Прикрепите файл до 50 мегабайт к ответу на задание."
                    >
                        Добавить файл
                        <i class="ph ph-plus text-[18px]"></i>
                        <input
                            class="hidden"
                            type="file"
                            oninput={e => {
                                const files = e.currentTarget.files;
                                if (!files) return;
                                const file = files.item(0);
                                if (!file) return;
                                if (file.size > 50 * 1024 * 1024) {
                                    toaster.add(
                                        "Файл должен быть размером не более 50мб",
                                        "error"
                                    );
                                    return;
                                }
                                attachments.push(file);
                            }}
                        />
                    </label>
                {/if}
                <button class="btn" onclick={() => submit()}>
                    Отправить
                    <i class="ph ph-paper-plane-right text-[21px]"></i>
                </button>
            </menu>
        </section>
    {/if}
</section>
