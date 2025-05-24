<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import { userFilePath } from "itam-edu-common";
    import Chart from "./Chart.svelte";
    import Loader from "$lib/components/Loader.svelte";

    const { data } = $props();

    const expelStudent = async (studentId: string) => {
        if (confirm("Вы уверены, что хотите отчислить студента?")) {
            await api({ fetch })
                .courses({ course: data.course.id })
                .students({ student: studentId })
                .delete();
            await invalidate("app:students");
        }
    };
</script>

<svelte:head>
    <title>Аналитика | {data.course.title}</title>
</svelte:head>

<div class="flex flex-col gap-6 p-10">
    <header class="flex gap-4">
        <h2>Аналитика</h2>
    </header>
    <section class="flex flex-wrap gap-6">
        <div
            class="flex-1 relative overflow-hidden aspect-[2.5] min-w-100 p-6 pb-8 bg-surface shadow rounded-xl"
        >
            {#await data.stats}
                <Loader />
            {:then stats}
                <Chart label="Студенты" data={stats.students} />
            {/await}
        </div>
        <div
            class="flex-1 relative aspect-[2.5] min-w-100 p-6 pb-8 bg-surface shadow rounded-xl"
        >
            {#await data.stats}
                <Loader />
            {:then stats}
                <Chart label="Сотрудники" data={stats.staff} />
            {/await}
        </div>
    </section>
    <section class="flex flex-col p-6 pb-8 bg-surface shadow rounded-xl">
        <header class="flex justify-between items-center h-11">
            <h3 class="text-on-surface-contrast">Студенты</h3>
            <span class="text-h4 text-on-surface">
                {data.students.length} чел.
            </span>
        </header>
        <hr class="text-primary-border my-5" />
        <ol
            class={[
                "grid gap-4 grid-cols-1",
                "@min-[1200px]/main:grid-cols-2",
                "max-h-120 overflow-y-auto"
            ]}
        >
            {#each data.students as student (student.id)}
                <li
                    class="flex-1 flex gap-4 min-w-100 p-4 bg-surface-tint rounded-md shadow"
                >
                    <div
                        class="flex justify-center items-center w-16 h-16 overflow-hidden rounded-2xs bg-primary"
                        aria-hidden="true"
                    >
                        {#if student.avatar}
                            <img
                                src={userFilePath(student.id).avatar(
                                    student.avatar
                                )}
                                alt=""
                            />
                        {:else}
                            <span class="text-on-primary text-comment">
                                {student.tgUsername[0]}
                            </span>
                        {/if}
                    </div>
                    <div
                        class="flex flex-col gap-1 justify-center items-start overflow-hidden"
                    >
                        <h4 class="text-nowrap">
                            {student.firstName}
                            {student.lastName}
                        </h4>
                        <a
                            class="text-primary text-date hover:underline"
                            href={`https://t.me/${student.tgUsername}`}
                            target="_blank"
                        >
                            @{student.tgUsername}
                        </a>
                    </div>
                    <button
                        class={[
                            "flex justify-center items-center",
                            "ml-auto self-center shrink-0",
                            "size-12 rounded-xs p-2",
                            "bg-on-primary text-primary",
                            "border border-primary-border hover:border-primary",
                            "transition-colors duration-100"
                        ]}
                        title="Отчислить студента"
                        aria-label="Отчислить студента"
                        onclick={() => expelStudent(student.id)}
                    >
                        <i class="ph ph-x text-[20px] mt-[1px]"></i>
                    </button>
                </li>
            {:else}
                Пока никого!
            {/each}
        </ol>
    </section>
</div>
