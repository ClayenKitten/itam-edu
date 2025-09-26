<script lang="ts">
    import { coursePath } from "$lib/path";
    import type {
        Course,
        HomeworkPartial,
        Student,
        SubmissionPartial
    } from "$lib/types";
    import { format as formatDate } from "date-fns";

    const { course, homeworks, submissions, students }: Props = $props();
    type Props = {
        course: Course;
        homeworks: HomeworkPartial[];
        submissions: SubmissionPartial[];
        students: Student[];
    };

    let search = $state("");
    const filteredHomeworks = $derived(
        homeworks.filter(hw =>
            hw.title.toLowerCase().includes(search.toLowerCase().trim())
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
        "grid-cols-[1fr_repeat(3,max-content)]"
    ]}
>
    <header class="contents text-md-medium text-on-surface-muted">
        <div>Название</div>
        <div
            class="text-end cursor-help"
            title="Количество принятых преподавателем работ"
        >
            Сданы
        </div>
        <div
            class="text-end cursor-help"
            title="Количество сданных, но непроверенных работ"
        >
            Ждут проверки
        </div>
        <div class="w-12.5"></div>
    </header>
    <hr class="border-surface-border my-1 col-span-full" />
    {#each filteredHomeworks as homework}
        {@const hwSubmissions = submissions.filter(
            s => s.homework.id === homework.id
        )}
        <div class="flex flex-col justify-between min-w-0">
            <span
                class="text-xl-medium overflow-hidden overflow-ellipsis whitespace-nowrap"
            >
                {homework.title}
            </span>
            <div class="text-md-regular">
                {#if homework.deadline}
                    Дедлайн до {formatDate(homework.deadline, "dd.MM hh:mm")}
                {:else}
                    Без дедлайна, приём работ
                    {#if homework.deadlineOverride === false}
                        закрыт
                    {:else}
                        открыт
                    {/if}
                {/if}
            </div>
        </div>
        <div class="text-lg-medium text-end">
            {hwSubmissions.filter(s => s.accepted === true).length}
            /
            {students.length}
        </div>
        <div class="text-lg-medium text-end">
            {hwSubmissions.filter(s => s.accepted === null).length}
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
                    href={`${coursePath(course)}/homeworks/${homework.id}`}
                >
                    <i class="ph ph-arrow-right"></i>
                    К заданию
                </a>
                <a
                    class="context-menu-item"
                    href={`${coursePath(course)}/homeworks/review?homework=${homework.id}`}
                >
                    <i class="ph ph-envelope"></i>
                    К сданным работам
                </a>
            </menu>
        </div>
    {:else}
        <div class="flex flex-col items-center col-span-full my-12 gap-2">
            {#if !search}
                <h4>Пусто! 🐈</h4>
                <span class="text-lg-regular text-on-surface-muted text-center">
                    В курсе ещё нет заданий
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
