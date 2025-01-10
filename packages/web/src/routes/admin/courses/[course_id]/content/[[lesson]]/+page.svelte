<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import { innerWidth } from "svelte/reactivity/window";
    import CreateLessonModal from "./CreateLessonModal.svelte";
    import DraggableList from "./DraggableList.svelte";

    const { data } = $props();

    const popoverMode = $derived((innerWidth.current ?? 0) < 1024);
</script>

<svelte:head>
    {#if popoverMode && data.lesson !== null}
        <style>
            body {
                overflow: hidden !important;
            }
        </style>
    {/if}
</svelte:head>

{#snippet lesson(lesson: (typeof data.lessons)[number])}
    <a
        href={`/admin/courses/${data.course.id}/content/${lesson.slug}`}
        class={[
            "flex gap-2.5 px-5 py-2.5 rounded-sm",
            data.lesson?.slug === lesson.slug
                ? "bg-primary"
                : "hover:bg-surface-light"
        ]}
    >
        {lesson.title}
    </a>
{/snippet}

<section class="flex gap-5">
    <aside class="max-lg:flex-1 flex flex-col gap-5 lg:w-80">
        <nav class="flex flex-col justify-between bg-surface text-text rounded">
            <header class="flex justify-between items-center p-5">
                <h2 class="text-2xl">Lessons</h2>
                <button
                    aria-label="Add new lesson"
                    class="flex self-end gap-2.5 p-2 bg-success hover:opacity-95 rounded-full"
                    popovertarget="createLessonModal"
                    popovertargetaction="show"
                >
                    <i class="ph ph-plus text-lg"></i>
                </button>
                <CreateLessonModal
                    id="createLessonModal"
                    oncreate={async lesson => {
                        await api({ fetch }).courses[":course"].lessons.$post({
                            param: { course: data.course.id },
                            json: lesson
                        });
                        await invalidate("app:lessons");
                    }}
                />
            </header>
            <hr class="border-surface-light" />
            <DraggableList
                items={data.lessons.filter(x => x.position >= 0)}
                id={item => item.slug}
                class="flex flex-col items-stretch gap-2.5 p-5"
                children={lesson}
            >
                {#snippet empty()}
                    <span
                        class={[
                            "p-2.5 text-center text-base italic text-text-opaque rounded-sm",
                            "[.droptarget_&]:bg-surface-light [.droptarget_&]:text-text"
                        ]}
                    >
                        No lessons
                    </span>
                {/snippet}
            </DraggableList>
        </nav>
        <menu
            class="flex flex-col justify-between bg-surface text-text rounded"
        >
            <header class="flex justify-between items-center p-5">
                <h2 class="text-2xl">Archive</h2>
                <i class="ph ph-archive text-xl"></i>
            </header>
            <hr class="border-surface-light" />
            <DraggableList
                items={data.lessons.filter(x => x.position < 0)}
                id={item => item.slug}
                class="flex flex-col items-stretch gap-2.5 p-5"
                children={lesson}
            >
                {#snippet empty()}
                    <span
                        class={[
                            "p-2.5 text-center text-base italic text-text-opaque rounded-sm",
                            "[.droptarget_&]:bg-surface-light [.droptarget_&]:text-text"
                        ]}
                    >
                        No lessons archived
                    </span>
                {/snippet}
            </DraggableList>
        </menu>
    </aside>
    <article
        class={[
            "fixed inset-0 max-lg:overflow-auto",
            "lg:flex-1 lg:flex lg:static lg:inset-auto",
            "flex-col gap-5 p-8 bg-surface text-text lg:rounded",
            data.lesson === null ? "hidden" : "flex z-20"
        ]}
    >
        {#if data.lesson}
            <header class="flex flex-col">
                <h1 class="text-3xl font-bold">{data.lesson.title}</h1>
                <h2
                    class="flex items-center gap-1 w-max text-xl text-text-opaque"
                >
                    {data.course.slug}/{data.lesson.slug}
                </h2>
                <a
                    aria-label="Close"
                    href={`/admin/courses/${data.course.id}/content`}
                    class="absolute block lg:hidden top-8 right-8"
                >
                    <i class="ph ph-x text-3xl"></i>
                </a>
            </header>
            {#if data.lesson.content}
                <div class="text-base">{data.lesson.content}</div>
            {/if}
        {:else}
            <p
                class="flex justify-center items-center w-full h-full text-3xl text-text-opaque"
            >
                Select lesson in the menu
            </p>
        {/if}
    </article>
</section>
