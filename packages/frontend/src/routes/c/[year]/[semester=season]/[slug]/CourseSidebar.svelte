<script lang="ts">
    import { page } from "$app/state";
    import { dismissable } from "$lib/attachments/dismissable.svelte";
    import { formatLessonPlace } from "$lib/format";
    import { coursePath, filePath } from "$lib/path";
    import type { Course, CoursePartial, LessonPartial } from "$lib/types";
    import { format as formatDate, formatDistanceToNowStrict } from "date-fns";
    import { ru } from "date-fns/locale";
    import type { User } from "itam-edu-common";
    import { onMount } from "svelte";

    let { course, courses, user }: Props = $props();
    type Props = {
        course: Course;
        courses: CoursePartial[];
        user: User | null;
    };

    let isCourseSelectorOpen = $state(false);

    export function open() {
        dialog?.showModal();
    }
    let dialog = $state<HTMLDialogElement>();

    const scheduledLessons = $derived(
        course.lessons
            .filter(l => l.schedule !== null)
            .sort(
                (a, b) =>
                    a.schedule!.date.getTime() - b.schedule!.date.getTime()
            ) as LessonPartialWithSchedule[]
    );

    const ongoingLesson = $derived(
        scheduledLessons.find(l => {
            const diff = new Date().getTime() - l.schedule.date.getTime();
            return diff > 0 && diff < 2 * 60 * 60 * 1000;
        }) ?? null
    );

    const upcomingLesson = $derived(
        scheduledLessons.find(l => l.schedule!.date > new Date()) ?? null
    );

    type LessonPartialWithSchedule = LessonPartial & {
        schedule: Exclude<LessonPartial["schedule"], null>;
    };
</script>

<div class={["sticky top-0 h-dvh hidden md:flex"]}>
    {@render menu(false)}
</div>

<dialog
    bind:this={dialog}
    onclick={() => {
        dialog?.close();
    }}
    class={["fixed z-50 h-dvh w-full md:hidden"]}
>
    {@render menu(true)}
</dialog>

{#snippet menu(isDialog: boolean)}
    <nav
        class={[
            "row-span-2 h-full flex-col gap-6 p-5",
            "bg-surface border-r border-surface-border",
            isDialog ? "md:hidden flex" : "hidden md:flex"
        ]}
    >
        {@render courseSelector()}
        <ul class="flex flex-col gap-2">
            {@render link("/", "Главная", "house")}
            {@render link("/lessons", "Уроки", "folder")}
            {@render link("/homeworks", "Задания", "book-open-text")}
            {@render link("/about", "О курсе", "info")}
        </ul>
        {#if user && (user.isCourseStaff(course.id) || user.info.role === "admin" || user.info.role === "supervisor")}
            <hr class="text-surface-border -mx-5" />
            <ul class="flex flex-col gap-2">
                {@render link("/calls", "Звонки", "video-conference")}
                {@render link("/analytics", "Аналитика", "chart-line")}
                {@render link("/settings", "Настройки", "gear-six")}
            </ul>
        {/if}
        {@render lessonNotification()}
    </nav>
{/snippet}

{#snippet courseSelector()}
    <details
        class="group relative flex items-center w-full h-max text-lg-medium cursor-pointer"
        bind:open={isCourseSelectorOpen}
        {@attach dismissable(() => (isCourseSelectorOpen = false))}
    >
        <summary
            class={[
                "w-full h-13 flex justify-between items-center px-4 bg-surface-dimmed",
                "border border-surface-border",
                "rounded-xs shadow"
            ]}
        >
            <div class="flex items-center gap-1.5 min-w-0">
                {#if course.icon}
                    <img src={filePath(course.icon)} class="size-8" alt="" />
                {/if}
                <span
                    class="overflow-hidden overflow-ellipsis whitespace-nowrap"
                >
                    {course.title}
                </span>
            </div>
            <i class="hidden group-open:flex ph ph-caret-up"></i>
            <i class="group-open:hidden flex ph ph-caret-down"></i>
        </summary>
        <ul
            class={[
                "flex flex-col absolute top-0 pt-13 inset-x-0 rounded-xs overflow-hidden",
                "border border-t-0 border-surface-border"
            ]}
        >
            {#each courses.filter(x => x.id !== course.id && (user === null || user.isCourseMember(x.id))) as courseOption}
                <a
                    class={[
                        "flex items-center gap-1.5 h-13 px-4 overflow-hidden",
                        "bg-surface hover:bg-surface-tint",
                        "transition-colors duration-100"
                    ]}
                    href={coursePath(courseOption)}
                    onclick={() => (isCourseSelectorOpen = false)}
                    data-sveltekit-preload-data="off"
                >
                    {#if courseOption.icon}
                        <img
                            src={filePath(courseOption.icon)}
                            class="size-8"
                            alt=""
                        />
                    {/if}
                    <span
                        class="overflow-hidden overflow-ellipsis whitespace-nowrap"
                    >
                        {courseOption.title}
                    </span>
                </a>
            {:else}
                <div class="text-md-regular bg-surface-tint p-4 rounded-b-xs">
                    Пусто! Поступить на новые курсы можно на
                    <a class="text-primary hover:underline" href="/">
                        домашней странице
                    </a>.
                </div>
            {/each}
        </ul>
    </details>
{/snippet}

{#snippet link(path: string, text: string, icon: string)}
    {@const prefix = coursePath(course)}
    {@const startsWith = page.url.pathname.startsWith(prefix + path)}
    {@const enabled =
        (path === "/" && page.url.pathname === prefix) ||
        (path !== "/" && startsWith)}
    <a
        href={prefix + path}
        class={[
            "flex items-center gap-3 text-md-medium p-2.5 rounded-xs",
            enabled
                ? "text-on-primary bg-primary"
                : "text-on-surface bg-transparent hover:bg-surface-tint"
        ]}
        data-sveltekit-preload-data="off"
    >
        {#if enabled}
            <i class="ph-fill ph-{icon} text-[24px]"></i>
        {:else}
            <i class="ph ph-{icon} text-[24px]"></i>
        {/if}
        <span>{text}</span>
    </a>
{/snippet}

{#snippet lessonNotification()}
    {#if ongoingLesson !== null}
        {@render lessonNotificationCard({
            title: "Урок уже начался!",
            place: formatLessonPlace(ongoingLesson.schedule),
            href: `${coursePath(course)}/lessons/${ongoingLesson.id}`,
            highlighted: true
        })}
    {:else if upcomingLesson !== null}
        {@const isSoon = (() => {
            const diff =
                upcomingLesson.schedule.date.getTime() - new Date().getTime();
            return diff > 0 && diff < 8 * 60 * 60 * 1000;
        })()}
        {@render lessonNotificationCard({
            title: isSoon ? "Урок начнётся через" : "Следующий урок",
            subtitle: isSoon
                ? `${formatDistanceToNowStrict(upcomingLesson.schedule.date, { locale: ru })}`
                : formatDate(
                      upcomingLesson.schedule.date,
                      "dd.MM (cccccc) в HH:mm",
                      { locale: ru }
                  ),
            place: formatLessonPlace(upcomingLesson.schedule),
            href: `${coursePath(course)}/lessons/${upcomingLesson.id}`,
            highlighted: isSoon
        })}
    {/if}
{/snippet}

{#snippet lessonNotificationCard(opts: {
    title: string;
    subtitle?: string;
    place: string;
    href: string;
    highlighted: boolean;
})}
    <a
        class={[
            "mt-auto px-5 py-3 flex flex-col",
            opts.highlighted
                ? "bg-on-primary border-primary-border hover:border-primary"
                : "bg-surface-tint hover:bg-on-primary border-primary-border hover:border-primary",
            "border rounded-sm",
            "whitespace-nowrap",
            "transition-colors duration-200"
        ]}
        href={opts.href}
    >
        <p class="text-lg-medium text-on-surface">{opts.title}</p>
        {#if opts.subtitle}
            <p class="text-lg-medium text-on-surface">{opts.subtitle}</p>
        {/if}
        <p
            class={[
                "mt-1 overflow-hidden overflow-ellipsis",
                "text-sm-regular text-on-surface-muted"
            ]}
        >
            {opts.place}
        </p>
    </a>
{/snippet}
