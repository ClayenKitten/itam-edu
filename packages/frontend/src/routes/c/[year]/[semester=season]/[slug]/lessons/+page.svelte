<script lang="ts">
    import { goto } from "$app/navigation";
    import IconButton from "$lib/components/IconButton.svelte";
    import LessonCard from "$lib/components/LessonCard.svelte";
    import { coursePath } from "$lib/path";
    import LessonEditModal from "./LessonEditModal.svelte";

    let { data } = $props();

    let modal: LessonEditModal;
</script>

<LessonEditModal
    bind:this={modal}
    course={data.course}
    lessons={data.lessons}
/>

<div class="flex flex-col gap-10 m-10 @min-[1200px]/main:mx-40">
    <header class="flex gap-4">
        <h2>Уроки</h2>
        {#if data.course.permissions.lessons.edit === true}
            {#if data.lessons.length > 0}
                <IconButton
                    icon="ph-pencil-simple"
                    title="Редактировать"
                    onclick={() => modal.show()}
                />
            {/if}
            <IconButton
                icon="ph-plus"
                title="Создать"
                onclick={() => goto(`${coursePath(data.course)}/lessons/new`)}
            />
        {/if}
    </header>
    <div class="flex flex-wrap gap-x-4 gap-y-5">
        {#each data.lessons as lesson, i}
            <LessonCard course={data.course} position={i + 1} {lesson} />
        {:else}
            <div class="flex flex-col mt-[25dvh] mx-auto items-center gap-2">
                <h4 class="text-on-surface-contrast">Уроков ещё нет 🫠</h4>
                <span class="text-lg-regular text-on-surface-muted">
                    Но скоро будут!
                    <a
                        class="text-primary underline"
                        href="https://info.itatmisis.ru/coworking"
                        target="_blank"
                    >
                        А пока можете посетить наш коворкинг
                    </a>.
                </span>
            </div>
        {/each}
    </div>
</div>
