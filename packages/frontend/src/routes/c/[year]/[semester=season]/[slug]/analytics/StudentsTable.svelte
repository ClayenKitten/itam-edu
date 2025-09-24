<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import { coursePath, filePath } from "$lib/path";
    import type {
        Attendee,
        Course,
        LessonPartial,
        HomeworkPartial,
        Student,
        SubmissionPartial
    } from "$lib/types";

    const {
        course,
        lessons,
        homeworks,
        students,
        attendees,
        submissions
    }: Props = $props();
    type Props = {
        course: Course;
        lessons: LessonPartial[];
        homeworks: HomeworkPartial[];
        students: Student[];
        attendees: Attendee[];
        submissions: SubmissionPartial[];
    };

    let search = $state("");
    const searchWords = $derived(search.trim().toLowerCase().split(" "));
    const filteredStudents = $derived(
        students.filter(student =>
            searchWords.every(searchWord => {
                if (
                    ("@" + student.tgUsername.toLowerCase()).includes(
                        searchWord
                    )
                ) {
                    return true;
                }
                if (student.firstName.toLowerCase().includes(searchWord)) {
                    return true;
                }
                if (student.lastName?.toLowerCase().includes(searchWord)) {
                    return true;
                }
                return false;
            })
        )
    );

    const expelStudent = async (student: Student) => {
        if (
            confirm(
                `Вы уверены, что хотите отчислить студента @${student.tgUsername}?`
            )
        ) {
            await api({ fetch })
                .courses({ course: course.id })
                .students({ student: student.id })
                .delete();
            await invalidate("app:students");
        }
    };
</script>

<menu class="flex h-11 gap-2">
    <input
        class={[
            "flex-1 mr-auto px-2.5 max-w-90",
            "text-md-regular text-on-surface placeholder:text-on-surface-muted",
            "bg-surface-tint border border-surface-border rounded-2xs"
        ]}
        type="search"
        placeholder="Поиск..."
        bind:value={search}
    />
</menu>
<div
    class={[
        "grid gap-y-4 gap-x-12 items-center",
        "grid-cols-[1fr_repeat(3,max-content)]"
    ]}
>
    <header class="contents text-md-medium text-on-surface-muted">
        <div>Имя</div>
        <div class="text-end">Посещено уроков</div>
        <div class="text-end">Сдано заданий</div>
        <div class="w-12.5"></div>
    </header>
    <hr class="border-surface-border my-1 col-span-full" />
    {#each filteredStudents as student}
        {@const attends = attendees.filter(a => a.userId === student.id)}
        {@const submissionsAccepted = submissions.filter(
            s => s.student.id === student.id && s.accepted === true
        )}
        {@const submissionsWaiting = submissions.filter(
            s => s.student.id === student.id && s.accepted === null
        )}
        <div class="flex gap-2">
            <div
                class="cover size-[50px] text-md-regular rounded-xs"
                style:background-image={student.avatar
                    ? `url(${filePath(student.avatar)})`
                    : null}
            >
                <span>{student.tgUsername[0]}</span>
            </div>
            <div class="flex flex-col justify-between">
                <span class="text-xl-medium">
                    {student.firstName}
                    {student.lastName}
                </span>
                <span class="text-md-regular">
                    @{student.tgUsername}
                </span>
            </div>
        </div>
        <div class="text-lg-medium text-end">
            {attends.length} / {lessons.length}
        </div>
        <div
            class={[
                "text-lg-medium text-end",
                submissionsWaiting.length > 0 &&
                    "underline decoration-dotted underline-offset-3 cursor-help"
            ]}
            title={submissionsWaiting.length > 0
                ? `${submissionsWaiting.length} работы ждут проверки`
                : null}
        >
            {submissionsAccepted.length} / {homeworks.length}
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
                    href={`${coursePath(course)}/homeworks/review?student=${student.id}`}
                >
                    <i class="ph ph-arrow-right"></i>
                    К сданным заданиям
                </a>
                {#if course.permissions.students.remove === true}
                    <button
                        class="context-menu-item"
                        onclick={() => expelStudent(student)}
                    >
                        <i class="ph ph-user-minus"></i>
                        Отчислить
                    </button>
                {/if}
            </menu>
        </div>
    {:else}
        <div class="flex flex-col items-center col-span-full my-12 gap-2">
            {#if !search}
                <h4>Пусто! 🐈</h4>
                <span class="text-lg-regular text-on-surface-muted text-center">
                    На курс ещё никто не зачислился
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
