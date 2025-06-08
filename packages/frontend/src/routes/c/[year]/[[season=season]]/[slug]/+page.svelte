<script lang="ts">
    import LessonCard from "$lib/components/LessonCard.svelte";
    import { coursePath } from "$lib/path";
    import { courseFilePath } from "itam-edu-common";
    import CourseUpdateCard from "./CourseUpdateCard.svelte";

    let { data } = $props();
</script>

<svelte:head>
    <title>Главная | {data.course.title}</title>
</svelte:head>

<div class="w-min mx-auto flex flex-col gap-10 px-7 pb-10">
    <header class="flex flex-col">
        <div class="banner w-full aspect-[5] mb-7.5 rounded-lg overflow-hidden">
            {#if data.course.banner}
                <img
                    class={[
                        "w-full h-full object-cover object-center",
                        data.course.banner ? `` : ""
                    ]}
                    src={courseFilePath(data.course.id).public(
                        data.course.banner
                    )}
                    alt=""
                />
            {/if}
        </div>
        <h1>{data.course.title}</h1>
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
                "h-[291px] overflow-y-hidden",
                "@max-[800px]/main:w-[356px]",
                "@min-[800px]/main:w-[calc(356px_*_2_+_16px)]",
                "@min-[1200px]/main:w-[calc(356px_*_3_+_16px_*_2)]",
                "@min-[1600px]/main:w-[calc(356px_*_4_+_16px_*_3)]"
            ]}
        >
            {#each data.lessons.toReversed().slice(0, 4) as lesson, i}
                <LessonCard
                    course={data.course}
                    {lesson}
                    position={data.lessons.length - i}
                />
            {:else}
                <div
                    class="self-center mx-auto flex flex-col items-center gap-2"
                >
                    <h4 class="text-on-surface-contrast">Уроков ещё нет 🫠</h4>
                    <!-- TODO: make changelog actually expire and specify how long it is stored. -->
                    <span
                        class="text-lg-regular text-on-surface-muted text-center"
                    >
                        Но скоро будут! А пока можете сходить на пары, вас там
                        заждались.
                    </span>
                </div>
            {/each}
        </ol>
    </section>
    <section class="flex flex-col p-6 pb-8 bg-surface shadow rounded-xl">
        <header class="flex justify-between items-center h-11">
            <h3>Обновления по курсу</h3>
        </header>
        <hr class="text-primary-border mt-5" />
        <ol class="flex flex-col max-h-120 overflow-auto mt-5 -mb-6 -mx-6">
            {#each data.changes as change}
                <CourseUpdateCard {data} {change} />
            {:else}
                <div class="self-center flex flex-col items-center gap-2 py-16">
                    <h4 class="text-on-surface-contrast">А где? 🫨</h4>
                    <!-- TODO: make changelog actually expire and specify how long it is stored. -->
                    <span
                        class="text-lg-regular text-on-surface-muted text-center"
                    >
                        Обновления по курсу хранятся ограниченное время.
                    </span>
                </div>
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
