<script lang="ts">
    import { goto, invalidate } from "$app/navigation";
    import { page } from "$app/state";
    import api from "$lib/api";
    import { coursePath } from "$lib/path";
    import type { Course, CoursePartial } from "$lib/types";
    import { courseFilePath, type User } from "itam-edu-common";

    const { course, courses, user }: Props = $props();
    const prefix = $derived(coursePath(course));

    type Props = {
        course: Course;
        courses: CoursePartial[];
        user: User | null;
    };

    const enroll = async () => {
        if (!user) return;
        const result = await api({ fetch })
            .courses({ course: course.id })
            .students({ student: user.id })
            .put();
        if (result.error) {
            alert(result.status);
            return;
        }
        await invalidate("app:user");
    };
</script>

<nav
    class={[
        "sticky top-0 h-dvh row-span-2 flex flex-col gap-6 p-5",
        "bg-surface border-r border-surface-border"
    ]}
>
    <details
        class="group relative flex items-center w-full h-max text-lg-medium cursor-pointer"
    >
        <summary
            class={[
                "flex justify-between items-center h-13 px-4 bg-surface-tint",
                "rounded-xs group-open:rounded-b-none overflow-hidden"
            ]}
        >
            <div class="flex items-center gap-1.5">
                {#if course.icon}
                    <img
                        src={courseFilePath(course.id).public(course.icon)}
                        class="size-8"
                        alt=""
                    />
                {/if}
                {course.title}
            </div>
            <i class="hidden group-open:flex ph ph-caret-up"></i>
            <i class="group-open:hidden flex ph ph-caret-down"></i>
        </summary>
        <ul
            class="flex flex-col absolute top-13 w-full rounded-b-xs overflow-hidden"
        >
            {#each courses.filter(x => x.id !== course.id && (user === null || user.isCourseMember(x.id))) as courseOption}
                <a
                    class={[
                        "flex items-center gap-1.5 h-13 px-4 bg-surface-tint overflow-hidden"
                    ]}
                    href={coursePath(courseOption)}
                    data-sveltekit-preload-data="off"
                >
                    {#if courseOption.icon}
                        <img
                            src={courseFilePath(courseOption.id).public(
                                courseOption.icon
                            )}
                            class="size-8"
                            alt=""
                        />
                    {/if}
                    {courseOption.title}
                </a>
            {:else}
                <div
                    class="text-md-regular bg-surface-tint p-4 pt-0 rounded-b-xs"
                >
                    Пусто! Записаться на новые курсы можно на
                    <a class="text-primary hover:underline" href="/home">
                        домашней странице
                    </a>.
                </div>
            {/each}
        </ul>
    </details>
    <ul class="flex flex-col gap-2">
        {@render btn("/", "Главная", "house")}
        {@render btn("/lessons", "Уроки", "folder")}
        {@render btn("/homeworks", "Задания", "book-open-text")}
        {@render btn("/about", "О курсе", "info")}
    </ul>
    {#if user?.isCourseStaff(course.id)}
        <hr class="text-surface-border -mx-5" />
        <ul class="flex flex-col gap-2">
            {@render btn("/analytics", "Аналитика", "chart-line")}
            {@render btn("/settings", "Настройки", "gear-six")}
        </ul>
    {/if}
    {#if user && !user.isCourseStaff(course.id) && !user.isCourseStudent(course.id)}
        {@const open = course.isEnrollmentOpen}
        <button class="btn mt-auto" disabled={!open} onclick={enroll}>
            <i class="ph ph-student text-[24px]"></i>
            {#if open}
                Поступить на курс
            {:else}
                Поступление закрыто
            {/if}
        </button>
    {/if}
</nav>

{#snippet btn(path: string, text: string, icon: string)}
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
        <i class="ph ph-{icon} text-[24px]"></i>
        <span>{text}</span>
    </a>
{/snippet}
