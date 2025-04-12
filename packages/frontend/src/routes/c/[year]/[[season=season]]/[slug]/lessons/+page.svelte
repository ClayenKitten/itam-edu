<script lang="ts">
    import { goto } from "$app/navigation";
    import IconButton from "$lib/components/IconButton.svelte";
    import LessonCard from "$lib/components/LessonCard.svelte";
    import { coursePath } from "$lib/path";
    import LessonEditModal from "./LessonEditModal.svelte";

    let { data } = $props();

    let editing = $state(false);
</script>

<svelte:head>
    <title>Уроки | {data.course.title}</title>
</svelte:head>

<div class="flex flex-col gap-10 p-10">
    <header class="flex gap-4">
        <h2>Уроки</h2>
        {#if data.user?.hasCoursePermission(data.course.id, "canEditContent")}
            <IconButton
                icon="ph-pencil-simple"
                title="Редактировать"
                onclick={() => (editing = true)}
            />
            <IconButton
                icon="ph-plus"
                title="Создать"
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
        {#each data.lessons as lesson, i}
            <LessonCard course={data.course} position={i + 1} {lesson} />
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
