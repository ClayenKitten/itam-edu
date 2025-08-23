<script lang="ts">
    import { goto } from "$app/navigation";
    import IconButton from "$lib/components/IconButton.svelte";
    import Tag, { type TagKind } from "$lib/components/Tag.svelte";
    import { coursePath } from "$lib/path.js";
    import { format as formatDate } from "date-fns";
    import HomeworkListEditModal from "./HomeworkListEditModal.svelte";

    let { data } = $props();

    let modal: HomeworkListEditModal;

    const getTagKind = (homeworkId: string): TagKind | null => {
        if (!data.user) return null;
        if (!data.user.isCourseStudent(data.course.id)) return null;
        if (!data.submissions) return null;
        const submission = data.submissions.find(
            submission => submission.homework.id === homeworkId
        );
        if (!submission) return "new";
        if (submission.accepted === null) return "submitted";
        return submission.accepted ? "accepted" : "rejected";
    };
</script>

<svelte:head>
    <title>Задания | {data.course.title}</title>
</svelte:head>

<HomeworkListEditModal
    bind:this={modal}
    course={data.course}
    homeworks={data.homeworks}
/>

<div class="flex flex-col gap-10 p-10">
    <header class="flex gap-4">
        <h2>Задания</h2>
        {#if data.course.permissions.homeworks.edit === true}
            <IconButton
                icon="ph-pencil-simple"
                title="Редактировать"
                onclick={() => modal.show()}
            />
            <IconButton
                icon="ph-plus"
                title="Создать"
                onclick={() => goto(`${coursePath(data.course)}/homeworks/new`)}
            />
        {/if}
    </header>
    <div class="flex flex-col gap-2.5">
        {#each data.homeworks as homework}
            <a
                class="flex justify-between p-5 bg-surface rounded-xs shadow"
                href={`${coursePath(data.course)}/homeworks/${homework.id}`}
            >
                <div class="flex flex-col gap-2.5">
                    <header class="flex items-center gap-3">
                        <h5>{homework.title}</h5>
                        <Tag kind={getTagKind(homework.id)} />
                    </header>
                    <p class="text-on-surface-contrast opacity-50">
                        {#if homework.deadline}
                            <span>До</span>
                            <span>
                                {formatDate(homework.deadline, "dd.MM HH:mm")}
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
                <h4 class="text-on-surface-contrast">Заданий ещё нет 🫡</h4>
                <span class="text-lg-regular text-on-surface-muted">
                    Но скоро будут! А пока можете потрогать траву
                    <a
                        href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        target="_blank">🌱🌿🍃</a
                    >
                </span>
            </div>
        {/each}
    </div>
</div>
