<script lang="ts">
    import LessonCard from "$lib/components/LessonCard.svelte";
    import { coursePath } from "$lib/path";
    import { format as formatDate } from "date-fns";

    let { data } = $props();
</script>

<div class="w-max mx-auto flex flex-col gap-10 px-7 pb-10">
    <header class="flex flex-col mb-2.5">
        <div
            class="banner h-[191px] mb-7 rounded-lg overflow-hidden"
            aria-hidden="true"
        >
            {#if data.course.banner}
                <img
                    src={data.course.banner}
                    alt=""
                    class="w-full h-full object-cover object-center"
                />
            {/if}
        </div>
        <h1 class="mb-2.5">{data.course.title}</h1>
        {#if data.course.status}
            <h4 class="text-on-background-muted">{data.course.status}</h4>
        {/if}
    </header>
    <section class="flex flex-col gap-5 p-6 pb-8 bg-surface shadow rounded-xl">
        <header class="flex justify-between items-center">
            <h3>Уроки</h3>
            <a class="btn" href={`${coursePath(data.course)}/lessons`}>
                Все
                <i class="ph ph-arrow-right text-[26px]"></i>
            </a>
        </header>
        <ol
            class={[
                "flex flex-wrap gap-4",
                "h-[291px] overflow-y-hidden ",
                "@max-[800px]/main:w-[343px]",
                "@min-[800px]/main:w-[702px]",
                "@min-[1200px]/main:w-[1061px]",
                "@min-[1600px]/main:w-[1420px]"
            ]}
        >
            {#each data.lessons.toReversed().slice(0, 4) as lesson, i}
                <LessonCard
                    course={data.course}
                    {lesson}
                    position={data.lessons.length - i}
                />
            {:else}
                Пусто!
            {/each}
        </ol>
    </section>
    <section class="flex flex-col gap-5 p-6 pb-8 bg-surface shadow rounded-xl">
        <header class="flex justify-between items-center h-11">
            <h3>Обновления по курсу</h3>
        </header>
        <hr class="text-on-primary" />
        <ol class="flex flex-col gap-8 my-5">
            {#each data.updates as update}
                <a class="flex items-center gap-4" href={update.href}>
                    <img
                        class="w-13.5 h-13.5 rounded-sm"
                        src={update.avatarSrc}
                        alt=""
                    />
                    <header class="flex flex-col gap-1.5">
                        <p class="text-comment text-on-background">
                            {update.title}
                        </p>
                        <p class="text-base text-on-background-muted">
                            {update.detail}
                        </p>
                    </header>
                    <p class="ml-auto text-on-surface-muted">
                        {formatDate(update.date, "dd.MM.yy / HH:mm")}
                    </p>
                    <button
                        class="h-2.5 w-2.5 rounded-full"
                        class:bg-primary={update.unread}
                        title={update.unread ? "Не прочитано" : undefined}
                        aria-label={update.unread
                            ? "Не прочитано"
                            : "Прочитано"}
                    ></button>
                </a>
            {:else}
                Пусто!
            {/each}
        </ol>
    </section>
</div>

<style lang="scss">
    .banner {
        background: linear-gradient(
            -20deg,
            var(--color-primary),
            var(--color-on-primary)
        );
    }
</style>
