<script lang="ts">
    import { formatLessonSchedule } from "$lib/format";
    import { coursePath } from "$lib/path";
    import type {
        Attendee,
        Course,
        LessonPartial,
        StaffMember,
        Student
    } from "$lib/types";

    const { course, lessons, students, staff, attendees }: Props = $props();
    type Props = {
        course: Course;
        lessons: LessonPartial[];
        students: Student[];
        staff: StaffMember[];
        attendees: Attendee[];
    };

    let search = $state("");
    const filteredLessons = $derived(
        lessons.filter(lesson =>
            lesson.title.toLowerCase().includes(search.toLowerCase().trim())
        )
    );
</script>

<menu class="flex h-11 gap-2">
    <input
        class="input-small flex-1 mr-auto px-2.5 max-w-90"
        type="search"
        placeholder="Поиск..."
        bind:value={search}
    />
</menu>
<div
    class={[
        "grid gap-y-4 gap-x-12 items-center",
        "grid-cols-[1fr_max-content_min-content_max-content]"
    ]}
>
    <header class="contents text-md-medium text-on-surface-muted">
        <div>Название</div>
        <div class="text-end">Студенты</div>
        <div class="text-end">Преподаватели</div>
        <div class="w-12.5"></div>
    </header>
    <hr class="border-surface-border my-1 col-span-full" />
    {#each filteredLessons as lesson}
        {@const staffAttendees = attendees
            .filter(
                a =>
                    a.lessonId === lesson.id &&
                    staff.some(s => s.id === a.userId)
            )
            .map(a => staff.find(s => s.id === a.userId)!)}
        {@const studentAttendees = attendees.filter(
            a =>
                a.lessonId === lesson.id &&
                students.some(s => s.id === a.userId)
        )}
        <div class="flex flex-col justify-between min-w-0">
            <span
                class="text-xl-medium overflow-hidden overflow-ellipsis whitespace-nowrap"
            >
                {lesson.title}
            </span>
            <div class="text-md-regular text-on-surface-muted">
                {#if lesson.schedule}
                    {formatLessonSchedule(lesson.schedule)}
                {:else}
                    <span
                        class="cursor-help"
                        title="Дата и место проведения урока не указаны"
                    >
                        Не запланирован
                    </span>
                {/if}
            </div>
        </div>
        <div class="text-lg-medium text-end">
            <span
                class="cursor-help"
                title={[
                    `${studentAttendees.filter(a => a.format === "online").length} онлайн`,
                    `${studentAttendees.filter(a => a.format === "offline").length} очно`
                ].join(", ")}
            >
                {studentAttendees.length} / {students.length}
            </span>
        </div>
        <div class="flex flex-col gap-1 text-md-regular text-end">
            {#each staffAttendees as staff}
                <a
                    class="text-primary hover:underline"
                    href={`https://t.me/${staff.tgUsername}`}
                    target="_blank">@{staff.tgUsername}</a
                >
            {/each}
        </div>
        <div class="relative group ml-auto">
            <button
                class={[
                    "size-12.5 flex justify-center items-center",
                    "bg-surface hover:bg-surface-tint rounded-xs"
                ]}
                aria-label="Действия"
            >
                <i class="ph ph-dots-three-outline-vertical text-[20px]"></i>
            </button>
            <menu
                class={[
                    "not-group-focus-within:hidden",
                    "context-menu absolute top-12 right-0 z-10"
                ]}
            >
                <a
                    class="context-menu-item"
                    href={`${coursePath(course)}/lessons/${lesson.id}`}
                >
                    <i class="ph ph-arrow-right"></i>
                    К уроку
                </a>
                <a
                    class="context-menu-item"
                    href={`${coursePath(course)}/lessons/${lesson.id}/attendance`}
                >
                    <i class="ph ph-users-three"></i>
                    К посещаемости
                </a>
            </menu>
        </div>
    {:else}
        <div class="flex flex-col items-center col-span-full my-12 gap-2">
            {#if !search}
                <h4>Пусто! 🐈</h4>
                <span class="text-lg-regular text-on-surface-muted text-center">
                    В курсе ещё нет уроков
                </span>
            {:else}
                <h4>Ничего не нашлось! 🔎</h4>
                <span class="text-lg-regular text-on-surface-muted text-center">
                    Попробуйте изменить поисковой запрос
                </span>
            {/if}
        </div>
    {/each}
</div>
