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
    <section class="flex flex-col p-6 pb-8 gap-4 bg-surface shadow rounded-xl">
        <h3 class="flex items-center gap-4 h-11 text-on-surface-contrast">
            Студенты ({data.students.length})
        </h3>
        <ol
            class={[
                "grid grid-cols-[repeat(auto-fill,_minmax(360px,1fr))]",
                "gap-x-4 gap-y-6"
            ]}
        >
            {#each data.students as student (student.id)}
                {@const uncheckedSubmissions =
                    student.totalSubmissions -
                    student.acceptedSubmissions -
                    student.rejectedSubmissions}
                <li
                    class={[
                        "flex flex-col gap-4 p-4",
                        "bg-surface-tint shadow",
                        "border border-primary-border rounded-sm"
                    ]}
                >
                    <header class="flex gap-4">
                        <div
                            class="flex justify-center items-center size-12 overflow-hidden rounded-2xs bg-primary"
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
                                <span class="text-on-primary text-md-medium">
                                    {student.tgUsername[0]}
                                </span>
                            {/if}
                        </div>
                        <div
                            class="flex flex-col gap-1 justify-center items-start overflow-hidden"
                        >
                            <h5 class="text-nowrap">
                                {student.firstName}
                                {student.lastName}
                            </h5>
                            <a
                                class="text-primary text-md-regular hover:underline"
                                href={`https://t.me/${student.tgUsername}`}
                                target="_blank"
                            >
                                @{student.tgUsername}
                            </a>
                        </div>
                    </header>
                    <hr class="border-primary-border -mx-4" />
                    <ul class="flex gap-2">
                        <li
                            class={[
                                "flex items-center gap-1 px-4 py-2",
                                "text-primary bg-on-primary rounded-full",
                                "border border-primary-border hover:border-primary",
                                "transition-colors duration-100",
                                "cursor-help"
                            ]}
                            title={`${student.acceptedSubmissions} заданий сдано${uncheckedSubmissions > 0 ? `, ${uncheckedSubmissions} на проверке` : ""} (${Math.ceil((student.acceptedSubmissions / data.homeworks.length) * 100)}%)`}
                        >
                            <i class="ph ph-book-open-text text-[20px]"></i>
                            <span>
                                {student.acceptedSubmissions}
                                {#if uncheckedSubmissions > 0}
                                    + {uncheckedSubmissions}
                                {/if}
                            </span>
                        </li>
                        <button
                            class={[
                                "flex justify-center items-center",
                                "ml-auto self-center shrink-0",
                                "rounded-xs h-full aspect-square",
                                "bg-on-primary text-primary",
                                "border border-primary-border hover:border-primary",
                                "transition-colors duration-100"
                            ]}
                            title="Отчислить студента"
                            aria-label="Отчислить студента"
                            onclick={() => expelStudent(student.id)}
                        >
                            <i class="ph ph-x text-[16px] mt-[1px]"></i>
                        </button>
                    </ul>
                </li>
            {:else}
                Пока никого!
            {/each}
        </ol>
    </section>
</div>
