<script lang="ts">
    import { goto } from "$app/navigation";
    import IconButton from "$lib/components/IconButton.svelte";
    import Tag, { type TagKind } from "$lib/components/Tag.svelte";
    import { coursePath } from "$lib/path.js";
    import { format as formatDate } from "date-fns";
    import HomeworkListEditModal from "./HomeworkListEditModal.svelte";
    import type { HomeworkPartial } from "$lib/types";
    import EnrollSuggestion from "../EnrollSuggestion.svelte";

    let { data } = $props();

    let modal: HomeworkListEditModal;

    const getTagKind = (homework: HomeworkPartial): TagKind | null => {
        const isClosed = !doesAcceptSubmissions(homework);

        if (!data.user || !data.user.isCourseStudent(data.course.id)) {
            return isClosed ? "closed" : null;
        }

        const submission = data.submissions.find(
            submission => submission.homework.id === homework.id
        );
        if (!submission) {
            if (isClosed) {
                return "closed";
            }
            return "new";
        }
        if (submission.accepted === null) return "submitted";
        return submission.accepted ? "accepted" : "rejected";
    };
    const doesAcceptSubmissions = (homework: HomeworkPartial) => {
        return homework.deadlineOverride === null
            ? homework.deadline
                ? Date.now() < new Date(homework.deadline).getTime()
                : true
            : homework.deadlineOverride;
    };
</script>

<HomeworkListEditModal
    bind:this={modal}
    course={data.course}
    homeworks={data.homeworks}
/>

<div class="flex flex-col gap-10 m-10 max-w-[1200px] @min-[1200px]/main:mx-40">
    <header class="flex gap-4">
        <h2>Задания</h2>
        {#if data.course.permissions.homeworks.edit === true}
            {#if data.homeworks.length > 0}
                <IconButton
                    icon="ph-pencil-simple"
                    title="Редактировать"
                    onclick={() => modal.show()}
                />
            {/if}
            <IconButton
                icon="ph-plus"
                title="Создать"
                onclick={() => goto(`${coursePath(data.course)}/homeworks/new`)}
            />
        {/if}
    </header>
    <div class="flex flex-col gap-2.5">
        {#each data.homeworks as homework (homework.id)}
            <a
                class={[
                    "flex justify-between p-5 rounded-xs shadow",
                    doesAcceptSubmissions(homework)
                        ? "bg-surface"
                        : "bg-surface-tint border border-surface-border"
                ]}
                href={`${coursePath(data.course)}/homeworks/${homework.id}`}
            >
                <div class="flex flex-col gap-1">
                    <header class="flex items-center gap-3">
                        <h5>{homework.title}</h5>
                        <Tag kind={getTagKind(homework)} />
                    </header>
                    <p class="text-on-surface-contrast opacity-50">
                        {#if homework.deadline}
                            <span>До</span>
                            <span>
                                {formatDate(
                                    homework.deadline,
                                    "dd.MM.yyyy HH:mm"
                                )}
                            </span>
                        {:else}
                            Без дедлайна
                        {/if}
                    </p>
                </div>
                <i class="ph ph-caret-right text-[26px] self-center"></i>
            </a>
        {:else}
            <div class="flex flex-col mt-[25dvh] items-center gap-2">
                <h4 class="text-on-surface-contrast">Заданий ещё нет 😥</h4>
                <span class="text-lg-regular text-on-surface-muted">
                    Но скоро будут!
                    <a
                        class="text-primary underline"
                        href="https://info.itatmisis.ru/calendar"
                        target="_blank"
                    >
                        А пока можете сходить на хакатон
                    </a>.
                </span>
            </div>
        {/each}
    </div>
</div>
{#if data.course.isEnrollmentOpen && data.course.role === null}
    <EnrollSuggestion
        text="Поступи на курс, чтобы сдавать задания на проверку преподавателям"
        user={data.user}
        course={data.course}
    />
{/if}
