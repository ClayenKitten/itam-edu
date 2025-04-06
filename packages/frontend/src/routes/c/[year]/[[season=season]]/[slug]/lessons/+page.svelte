<script lang="ts">
    import { goto } from "$app/navigation";
    import IconButton from "$lib/components/IconButton.svelte";
    import LessonCard from "$lib/components/LessonCard.svelte";
    import { coursePath } from "$lib/path";
    import LessonEditModal from "./LessonEditModal.svelte";

    let { data } = $props();

    const canEdit =
        data.permissions?.course.find(x => x.courseId === data.course.id)
            ?.permissions.canEditContent === true;

    let editing = $state(false);
</script>

<div class="flex flex-col gap-10 p-10">
    <header class="flex gap-4">
        <h2>Занятия</h2>
        {#if canEdit}
            <IconButton
                icon="ph-pencil-simple"
                title="Редактировать"
                onclick={() => (editing = true)}
            />
            <IconButton
                icon="ph-plus"
                title="Добавить"
                onclick={() => goto(`${coursePath(data.course)}/lessons/new`)}
            />
        {/if}
    </header>
    <div
        class={[
            "grid gap-x-4 gap-y-5 gap-2.5",
            "grid-cols-[repeat(auto-fit,343px)]"
        ]}
    >
        {#each data.lessons.toReversed() as lesson, i}
            <LessonCard
                course={data.course}
                position={data.lessons.length - i}
                {lesson}
            />
        {/each}
    </div>
</div>

{#if editing}
    <LessonEditModal
        course={data.course}
        lessons={data.lessons}
        onclose={() => (editing = false)}
    />
{/if}
