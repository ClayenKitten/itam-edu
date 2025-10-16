<script lang="ts">
    import RichContent from "$lib/components/editor/RichContent.svelte";
    import { formatLessonSchedule } from "$lib/format.js";
    import { coursePath, filePath } from "$lib/path.js";
    import { format as formatDate } from "date-fns";
    import CallBanner from "./CallBanner.svelte";

    let { data } = $props();
</script>

<div
    class={[
        "flex flex-col h-full py-10 gap-7",
        "max-w-[1000px] mx-10 @min-[1200px]/main:mx-40"
    ]}
>
    <section class="flex flex-col gap-2">
        <a
            class="group self-start mb-3 flex items-center h-min gap-2 text-primary"
            href="{coursePath(data.course)}/lessons"
        >
            <i class="ph ph-caret-left text-[20px]"></i>
            <h5 class="group-hover:underline">К списку уроков</h5>
        </a>
        <header class="flex justify-between gap-8">
            <h2 class="wrap-anywhere">
                Урок {data.lesson.position + 1}. {data.lesson.title}
            </h2>
            <menu class="flex gap-2">
                {#if data.course.permissions.submissions.view === true}
                    <a
                        class={[
                            "flex justify-center items-center w-11.5 h-11.5 bg-on-primary rounded-xs basis-11.5 shrink-0",
                            "border border-on-primary hover:border-primary transition-colors duration-100"
                        ]}
                        href={`${coursePath(data.course)}/lessons/${data.lesson.id}/attendance`}
                        aria-label="Посещаемость"
                        title="Посещаемость"
                    >
                        <i class="ph ph-users-three text-primary text-[20px]"
                        ></i>
                    </a>
                {/if}
                {#if data.course.permissions.homeworks.edit === true}
                    <a
                        class={[
                            "flex justify-center items-center w-11.5 h-11.5 bg-on-primary rounded-xs basis-11.5 shrink-0",
                            "border border-on-primary hover:border-primary transition-colors duration-100"
                        ]}
                        href={`${coursePath(data.course)}/lessons/${data.lesson.id}/edit`}
                        aria-label="Редактировать"
                        title="Редактировать"
                    >
                        <i class="ph ph-pencil-simple text-primary text-[20px]"
                        ></i>
                    </a>
                {/if}
            </menu>
        </header>
        {#if data.lesson.schedule}
            <p class="text-md-regular text-on-background-muted">
                {formatLessonSchedule(data.lesson.schedule)}
            </p>
        {/if}
        {#if data.lesson.description}
            <p class="mt-4 wrap-anywhere">{data.lesson.description}</p>
        {/if}
    </section>
    <CallBanner lesson={data.lesson} />
    {#if data.lesson.video}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video
            class="self-start aspect-[16/9] w-full bg-surface-tint border border-surface-border shadow rounded-xs"
            controls
            preload="metadata"
            poster={data.lesson.banner ? filePath(data.lesson.banner) : null}
        >
            <source src={filePath(data.lesson.video)} />
        </video>
    {/if}
    {#if data.lesson.content}
        <section class="flex flex-col gap-3">
            <RichContent content={data.lesson.content} />
        </section>
    {/if}
    {#if data.lesson.homeworkIds.length > 0}
        <section class="flex flex-col gap-3">
            <h3>Задания</h3>
            <ul class="flex flex-col gap-2.5">
                {#each data.lesson.homeworkIds as homeworkId}
                    {@const homework = data.course.homeworks.find(
                        h => h.id === homeworkId
                    )!}
                    <a
                        class="flex justify-between p-5 bg-surface rounded-xs shadow"
                        href={`${coursePath(data.course)}/homeworks/${homework.id}`}
                    >
                        <div class="flex flex-col gap-3">
                            <header>
                                <h5>{homework.title}</h5>
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
