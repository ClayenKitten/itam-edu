<script lang="ts">
    import { coursePath } from "$lib/path";
    import { format as formatDate } from "date-fns";

    let { data } = $props();
</script>

<div class="banner h-[137px]" aria-hidden="true"></div>
<div class="flex flex-col gap-10 p-7">
    <header class="flex flex-col gap-2.5 mb-2.5">
        <h1>{data.course.title}</h1>
        <h4 class="text-on-background-muted">Blah blah</h4>
    </header>
    <section class="flex flex-col gap-5 p-6 pb-8 bg-surface shadow rounded-xl">
        <header class="flex justify-between items-center">
            <h3>Занятия</h3>
            <a class="btn" href={`${coursePath(data.course)}/lessons`}>
                Все
                <i class="ph ph-arrow-right text-[26px]"></i>
            </a>
        </header>
        <ol>
            {#each data.courseSummary.lessons as lesson}
                <a
                    class="flex flex-col"
                    href={`${coursePath(data.course)}/lessons/${lesson.slug}`}
                >
                    <h4>Занятие {lesson.position}</h4>
                    <p>{lesson.title}</p>
                </a>
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
            {#each data.courseSummary.updates as update}
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
        background: linear-gradient(97deg, #8c54d9, #c967ef);
    }
</style>
