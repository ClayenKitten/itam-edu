<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import { userFilePath } from "itam-edu-common";

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

<div class="flex flex-col gap-10 p-10">
    <header class="flex gap-4">
        <h2>Аналитика</h2>
    </header>
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
            {#each data.students as student (student.user.id)}
                <li class="flex-1 flex gap-4 min-w-100 p-4 bg-surface-tint rounded-md shadow">
                    <div
                        class="flex justify-center items-center w-16 h-16 overflow-hidden rounded-2xs bg-primary"
                        aria-hidden="true"
                    >
                        {#if student.user.avatar}
                            <img
                                src={userFilePath(student.user.id).avatar(
                                    student.user.avatar
                                )}
                                alt=""
                            />
                        {:else}
                            <span class="text-on-primary text-comment">
                                {student.user.tgUsername[0]}
                            </span>
                        {/if}
                    </div>
                    <div
                        class="flex flex-col gap-1 justify-center items-start overflow-hidden"
                    >
                        <h4 class="text-nowrap">
                            {student.user.firstName}
                            {student.user.lastName}
                        </h4>
                        <a
                            class="text-primary text-date hover:underline"
                            href={`https://t.me/${student.user.tgUsername}`}
                            target="_blank"
                        >
                            @{student.user.tgUsername}
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
                        onclick={() => expelStudent(student.user.id)}
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
