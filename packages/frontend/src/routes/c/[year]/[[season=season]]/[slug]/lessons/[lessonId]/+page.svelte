<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import IconButton from "$lib/components/IconButton.svelte";
    import TipTap from "$lib/components/TipTap.svelte";
    import { formatLessonSchedule } from "$lib/format.js";
    import { coursePath } from "$lib/path.js";
    import { format as formatDate } from "date-fns";
    import { courseFilePath } from "itam-edu-common";

    let { data } = $props();
</script>

<svelte:head>
    <title>{data.lesson.title} | {data.course.title}</title>
    <meta
        property="og:title"
        content="{data.lesson.title} | {data.course.title}"
    />
    <meta property="og:type" content="video.movie" />
    {#if data.lesson.description}
        <meta name="description" content={data.lesson.description} />
        <meta property="og:description" content={data.lesson.description} />
    {/if}
    <meta property="og:url" content={page.url.toString()} />
    {#if data.lesson.banner}
        {@const imgUrl = courseFilePath(data.course.id).public(
            data.lesson.banner
        )}
        <meta property="og:image" content={imgUrl} />
        <meta property="og:image:width" content="996" />
        <meta property="og:image:height" content="600" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={imgUrl} />
    {/if}
</svelte:head>

<div
    class={[
        "flex flex-col h-full py-10 gap-7",
        "max-w-[1000px] mx-10 @min-[1200px]/main:mx-40"
    ]}
>
    <section class="flex flex-col gap-2">
        <a
            class="flex items-center h-min mb-5.5 gap-2 text-h4 text-primary"
            href="{coursePath(data.course)}/lessons"
        >
            <i class="ph ph-caret-left text-[16px]"></i>
            Назад
        </a>
        <header class="flex gap-8">
            <h2>Урок {data.lesson.position + 1}. {data.lesson.title}</h2>
            {#if data.user?.hasCoursePermission(data.course.id, "canEditContent")}
                <IconButton
                    icon="ph-pencil-simple"
                    title="Редактировать"
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
    {#if data.lesson.video}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video
            controls
            preload="metadata"
            class="self-start max-h-150 shadow rounded-xs"
        >
            <source
                src={courseFilePath(data.course.id).public(data.lesson.video)}
            />
        </video>
    {/if}
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
            <h3>Задания</h3>
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
