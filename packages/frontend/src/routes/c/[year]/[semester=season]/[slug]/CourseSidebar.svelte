<script lang="ts">
    import { goto, invalidate } from "$app/navigation";
    import { page } from "$app/state";
    import api from "$lib/api";
    import { dismissable } from "$lib/attachments/dismissable.svelte";
    import { coursePath } from "$lib/path";
    import type { Course, CoursePartial } from "$lib/types";
    import { courseFilePath, type User } from "itam-edu-common";

    const { course, courses, user }: Props = $props();
    type Props = {
        course: Course;
        courses: CoursePartial[];
        user: User | null;
    };

    let isCourseSelectorOpen = $state(false);

    const enroll = async () => {
        if (!user) {
            await goto("?login");
            return;
        }
        const result = await api({ fetch })
            .courses({ course: course.id })
            .students({ student: user.id })
            .put();
        if (result.error) {
            alert(result.status);
            return;
        }
        await Promise.all([invalidate("app:course"), invalidate("app:user")]);
    };

    const enrollmentButton = $derived.by((): EnrollmentButton => {
        const isStaff = user && user.isCourseStaff(course.id);
        const isStudent = user && user.isCourseStudent(course.id);

        if (!course.isPublished) {
            return {
                text: "Курс не опубликован",
                icon: "eye-slash",
                mode: "label"
            };
        }
        if (course.isArchived) {
            return {
                text: "Курс в архиве",
                icon: "archive",
                mode: isStaff ? "label" : "disabled"
            };
        }

        if (isStudent) {
            return {
                text: "Вы студент курса",
                icon: "student",
                mode: "label"
            };
        } else if (isStaff) {
            return {
                text: course.isEnrollmentOpen
                    ? "Запись открыта"
                    : "Запись закрыта",
                icon: course.isEnrollmentOpen ? "door-open" : "door",
                mode: "label"
            };
        } else {
            if (course.isEnrollmentOpen) {
                return {
                    text: "Записаться на курс",
                    icon: "student",
                    mode: "button"
                };
            } else {
                return {
                    text: "Запись закрыта",
                    icon: "student",
                    mode: "disabled"
                };
            }
        }
    });
    type EnrollmentButton = {
        text: string;
        icon: string;
        mode: "button" | "label" | "disabled";
    };
</script>

<nav
    class={[
        "sticky top-0 h-dvh row-span-2 flex flex-col gap-6 p-5",
        "bg-surface border-r border-surface-border"
    ]}
>
    {@render courseSelector()}
    <ul class="flex flex-col gap-2">
        {@render link("/", "Главная", "house")}
        {@render link("/lessons", "Уроки", "folder")}
        {@render link("/homeworks", "Задания", "book-open-text")}
        {@render link("/about", "О курсе", "info")}
    </ul>
    {#if user?.isCourseStaff(course.id)}
        <hr class="text-surface-border -mx-5" />
        <ul class="flex flex-col gap-2">
            {@render link("/analytics", "Аналитика", "chart-line")}
            {@render link("/settings", "Настройки", "gear-six")}
        </ul>
    {/if}
    <button
        class={[
            "mt-auto flex justify-center items-center gap-2.5 h-11",
            "text-md-medium rounded-xs text-nowrap",
            enrollmentButton.mode === "button" && "text-on-primary bg-primary",
            enrollmentButton.mode === "label" &&
                "text-primary bg-on-primary cursor-default",
            enrollmentButton.mode === "disabled" &&
                "text-on-surface-muted bg-on-surface-disabled cursor-default"
        ]}
        disabled={enrollmentButton.mode !== "button"}
        onclick={enroll}
    >
        {#key enrollmentButton.icon}
            <i class="ph ph-{enrollmentButton.icon} text-[24px]"></i>
        {/key}
        <span>{enrollmentButton.text}</span>
    </button>
</nav>

{#snippet courseSelector()}
    <details
        class="group relative flex items-center w-full h-max text-lg-medium cursor-pointer"
        bind:open={isCourseSelectorOpen}
        {@attach dismissable(() => (isCourseSelectorOpen = false))}
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
                    onclick={() => (isCourseSelectorOpen = false)}
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
        <i class="ph ph-{icon} text-[24px]"></i>
        <span>{text}</span>
    </a>
{/snippet}
