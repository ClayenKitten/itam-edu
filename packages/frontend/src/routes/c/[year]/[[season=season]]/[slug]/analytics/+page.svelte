<script lang="ts">
    import type { Snapshot } from "./$types";
    import StudentsChart from "./StudentsChart.svelte";
    import LessonsChart from "./LessonsChart.svelte";
    import HomeworksChart from "./HomeworksChart.svelte";
    import StudentsTable from "./StudentsTable.svelte";
    import LessonsTable from "./LessonsTable.svelte";
    import HomeworksTable from "./HomeworksTable.svelte";

    const { data } = $props();

    let page = $state<"students" | "lessons" | "homeworks">("students");
    let mode = $state<"table" | "graph">("table");

    export const snapshot: Snapshot<{
        page: typeof page;
        mode: typeof mode;
    }> = {
        capture: () => ({ page, mode }),
        restore: value => {
            page = value.page;
            mode = value.mode;
        }
    };
</script>

<div
    class={[
        "flex flex-col h-full m-10",
        "max-w-[1100px] @min-[1200px]/main:mx-40"
    ]}
>
    <header class="mb-10">
        <h2>Аналитика</h2>
    </header>
    <!-- Summary cards -->
    <section class="flex gap-5 mb-10">
        <div
            class="flex-1 flex flex-col gap-2 p-6 bg-surface rounded-sm shadow"
        >
            <h2>{data.students.length}</h2>
            <p class="text-xl-medium text-on-surface-muted">Студентов</p>
        </div>
        <div
            class="flex-1 flex flex-col gap-2 p-6 bg-surface rounded-sm shadow"
        >
            <h2>{data.course.lessons.length}</h2>
            <p class="text-xl-medium text-on-surface-muted">Уроков</p>
        </div>
        <div
            class="flex-1 flex flex-col gap-2 p-6 bg-surface rounded-sm shadow"
        >
            <h2>{data.course.homeworks.length}</h2>
            <p class="text-xl-medium text-on-surface-muted">Заданий</p>
        </div>
    </section>
    <!-- Page and mode selectors -->
    <section class="flex h-12 justify-between mb-7.5">
        <menu class="flex gap-2">
            <button
                class={["tabBtn", page === "students" && "selected"]}
                onclick={() => (page = "students")}
            >
                Студенты
            </button>
            <button
                class={["tabBtn", page === "lessons" && "selected"]}
                onclick={() => (page = "lessons")}
            >
                Уроки
            </button>
            <button
                class={["tabBtn", page === "homeworks" && "selected"]}
                onclick={() => (page = "homeworks")}
            >
                Задания
            </button>
        </menu>
        <menu class="flex gap-2.5">
            <button
                class={["tabBtn square", mode === "table" && "selected"]}
                title="Таблица"
                aria-label="Таблица"
                onclick={() => (mode = "table")}
            >
                <i class="ph ph-table text-[22px]"></i>
            </button>
            <button
                class={["tabBtn square", mode === "graph" && "selected"]}
                title="График"
                aria-label="График"
                onclick={() => (mode = "graph")}
            >
                <i class="ph ph-chart-line text-[22px]"></i>
            </button>
        </menu>
    </section>
    <!-- Main content -->
    <article class="flex flex-col gap-5 p-6 bg-surface rounded-lg shadow">
        <h3>
            {#if page === "students"}
                Студенты
            {:else if page === "lessons"}
                Уроки
            {:else if page === "homeworks"}
                Задания
            {/if}
        </h3>
        {#if mode === "table"}
            {#if page === "students"}
                <StudentsTable
                    course={data.course}
                    lessons={data.lessons}
                    homeworks={data.homeworks}
                    students={data.students}
                    attendees={data.attendees}
                    submissions={data.submissions}
                />
            {:else if page === "lessons"}
                <LessonsTable
                    course={data.course}
                    lessons={data.lessons}
                    students={data.students}
                    staff={data.staff}
                    attendees={data.attendees}
                />
            {:else if page === "homeworks"}
                <HomeworksTable
                    course={data.course}
                    homeworks={data.homeworks}
                    submissions={data.submissions}
                    students={data.students}
                />
            {/if}
        {:else if mode === "graph"}
            {#if page === "students"}
                <StudentsChart data={data.statistics.students} />
            {:else if page === "lessons"}
                <LessonsChart
                    lessons={data.lessons}
                    attendees={data.attendees}
                    students={data.students}
                />
            {:else if page === "homeworks"}
                <HomeworksChart
                    homeworks={data.homeworks}
                    submissions={data.submissions}
                />
            {/if}
        {/if}
    </article>
</div>
