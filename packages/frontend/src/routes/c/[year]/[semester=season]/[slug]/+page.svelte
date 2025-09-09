<script lang="ts">
    import LessonCard from "$lib/components/LessonCard.svelte";
    import { coursePath } from "$lib/path";
    import { courseFilePath } from "itam-edu-common";
    import { getCourseChangeDisplay } from "./courseUpdate";
    import { format as formatDate } from "date-fns";

    let { data } = $props();
</script>

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
            <h3>Последние уроки</h3>
            <a class="btn" href={`${coursePath(data.course)}/lessons`}>
                Все
                <i class="ph ph-arrow-right text-[26px]"></i>
            </a>
        </header>
        <ol
            class={[
                "flex flex-wrap gap-4",
                "h-[295px] overflow-y-hidden",
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
        </ol>
    </section>
    <section class="flex flex-col p-6 pb-8 bg-surface shadow rounded-xl">
        <header class="flex justify-between items-center h-11">
            <h3>Обновления по курсу</h3>
        </header>
        <hr class="text-primary-border mt-5" />
        <ol class="flex flex-col max-h-120 overflow-auto mt-5 -mb-6 -mx-6">
            {#each data.changes as change}
                {@const display = getCourseChangeDisplay(
                    change,
                    data.user,
                    data.lessons,
                    data.homeworks
                )}
                {#if display}
                    <a
                        class="flex items-center gap-4 group px-6 py-4"
                        href={display.href
                            ? coursePath(data.course) + display.href
                            : null}
                        data-sveltekit-preload-data="off"
                    >
                        <i
                            class={[
                                `ph ph-${display.icon}`,
                                "shrink-0 flex justify-center items-center w-14.5 h-14.5",
                                "text-[24px] text-primary bg-on-primary rounded-sm",
                                "border border-primary-border group-hover:border-primary",
                                "transition-colors duration-100"
                            ]}
                        ></i>
                        <header class="flex flex-col">
                            <p class="text-lg-medium text-on-background">
                                {display.title}
                            </p>
                            <p class="text-md-regular text-on-background-muted">
                                {display.message}
                            </p>
                        </header>
                        <p class="ml-auto text-on-surface-muted">
                            {formatDate(change.createdAt, "dd.MM.yy / HH:mm")}
                        </p>
                    </a>
                {:else}
                    {console.error(
                        `Failed to display course changelog entry.\n\n${JSON.stringify(change.payload)}`
                    )}
                {/if}
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

<style>
    .banner {
        background: linear-gradient(
            -20deg,
            var(--color-primary),
            var(--color-on-primary)
        );
    }
</style>
