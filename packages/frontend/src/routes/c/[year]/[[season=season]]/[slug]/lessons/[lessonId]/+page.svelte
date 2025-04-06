<script lang="ts">
    import { goto } from "$app/navigation";
    import EditButton from "$lib/components/EditButton.svelte";
    import TipTap from "$lib/components/TipTap.svelte";
    import { formatLessonSchedule } from "$lib/format.js";
    import { coursePath } from "$lib/path.js";
    import { format as formatDate } from "date-fns";

    let { data } = $props();

    const canEdit =
        data.permissions?.course.find(x => x.courseId === data.course.id)
            ?.permissions.canEditContent === true;
</script>

<div
    class={[
        "flex flex-col h-full py-10 gap-7",
        "max-w-[1000px] mx-10 @min-[1200px]/main:mx-40"
    ]}
>
    <section class="flex flex-col gap-2">
        <header class="flex gap-8">
            <h2>Занятие {data.lesson.position + 1}. {data.lesson.title}</h2>
            {#if canEdit}
                <EditButton
                    onclick={() =>
                        goto(
                            `${coursePath(data.course)}/lessons/${data.lesson.id}/edit`
                        )}
                />
            {/if}
        </header>
        {#if data.lesson.schedule}
            <p class="text-date text-on-background-muted">
                {formatLessonSchedule(data.lesson.schedule)}
            </p>
        {/if}
        {#if data.lesson.description}
            <p class="mt-4">{data.lesson.description}</p>
        {/if}
    </section>
    {#if data.lesson.content}
        <section class="flex flex-col gap-5">
            <h3>Теория и материалы</h3>
            <article class="shadow px-8 py-6 rounded-lg">
                <TipTap content={data.lesson.content} readonly />
            </article>
        </section>
    {/if}
    {#if data.lesson.homeworks.length > 0}
        <section class="flex flex-col gap-5">
            <h3>Домашние задания</h3>
            <ul class="flex flex-col gap-2.5">
                {#each data.lesson.homeworks as homework}
                    <a
                        class="flex justify-between p-5 bg-surface rounded-xs shadow"
                        href={`${coursePath(data.course)}/homeworks/${homework.id}`}
                    >
                        <div class="flex flex-col gap-3">
                            <header>
                                <h4>{homework.title}</h4>
                            </header>
                            <p class="text-on-surface-contrast opacity-50">
                                {#if homework.deadline}
                                    <span>До</span>
                                    <span>
                                        {formatDate(
                                            homework.deadline,
                                            "dd.MM.yy / HH:mm"
                                        )}
                                    </span>
                                {:else}
                                    Без дедлайна
                                {/if}
                            </p>
                        </div>
                        <i class="ph ph-caret-right text-[26px] self-center"
                        ></i>
                    </a>
                {/each}
            </ul>
        </section>
    {/if}
</div>
