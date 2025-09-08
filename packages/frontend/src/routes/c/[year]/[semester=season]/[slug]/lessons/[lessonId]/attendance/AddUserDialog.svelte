<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import type {
        Attendee,
        Course,
        Lesson,
        StaffMember,
        Student
    } from "$lib/types";
    import { userFilePath } from "itam-edu-common";

    const { course, lesson, staff, students, attendees }: Props = $props();
    type Props = {
        course: Course;
        lesson: Lesson;
        staff: StaffMember[];
        students: Student[];
        attendees: Attendee[];
    };

    const members = $derived([...students, ...staff]);
    const getMember = (id: string) => {
        return members.find(m => m.id === id) ?? null;
    };

    let stagedUsers: { id: string; format: "online" | "offline" }[] = $state(
        []
    );

    let search: string = $state("");
    const filteredMembers = $derived.by(() => {
        if (search.trim() === "") return [];

        let searchWords = search.trim().toLowerCase().split(" ");
        return members.filter(member => {
            if (stagedUsers.find(staged => staged.id === member.id)) {
                return false;
            }
            return searchWords.every(searchWord => {
                if (
                    ("@" + member.tgUsername.toLowerCase()).includes(searchWord)
                ) {
                    return true;
                }
                if (member.firstName.toLowerCase().includes(searchWord)) {
                    return true;
                }
                if (member.lastName?.toLowerCase().includes(searchWord)) {
                    return true;
                }
                return false;
            });
        });
    });

    const addToStaging = (userId: string) => {
        if (attendees.some(a => a.userId === userId)) {
            return;
        }

        stagedUsers.push({
            id: userId,
            format: "offline"
        });
        search = "";
    };

    const save = async () => {
        const results = await Promise.allSettled(
            stagedUsers.map(async u =>
                api({ fetch })
                    .courses({ course: course.id })
                    .lessons({ lesson: lesson.id })
                    .attendees({ user: u.id })
                    .put({
                        format: u.format
                    })
            )
        );
        if (results.some(r => r.status === "rejected")) {
            const count = results.filter(r => r.status === "rejected").length;
            alert(`Failed to set attendance of ${count} users`);
        }
        await invalidate("app:attendees");
    };

    export function show() {
        dialog.showModal();
    }
    let dialog: HTMLDialogElement;
</script>

<dialog
    class={[
        "modal",
        "hidden open:flex flex-col gap-7.5 w-150 h-150 max-h-150 p-10 m-auto",
        "text-on-surface bg-surface rounded-xl",
        "backdrop:bg-[black] backdrop:opacity-30"
    ]}
    bind:this={dialog}
    onclose={() => {
        stagedUsers = [];
        search = "";
    }}
>
    <header class="flex justify-between">
        <h2>Отметить</h2>
        <button aria-label="Закрыть окно" onclick={() => dialog.close()}>
            <i class="ph ph-x text-[30px]"></i>
        </button>
    </header>
    {@render searchSection()}
    {@render stagingSection()}
    <footer class="flex gap-5">
        <button
            class="grow-1 btn big"
            onclick={async () => {
                await save();
                dialog.close();
            }}
        >
            Подтвердить
        </button>
    </footer>
</dialog>

{#snippet searchSection()}
    <section class="relative">
        <input
            class={[
                "w-full h-11 px-2.5",
                "text-md-regular text-on-surface placeholder:text-on-surface-muted",
                "bg-surface-tint border border-surface-border rounded-2xs outline-0",
                search && "border-b-0 rounded-b-none"
            ]}
            type="search"
            placeholder="Начните вводить имя или Telegram-юзернейм..."
            bind:value={search}
            onkeydown={e => {
                if (e.key === "Enter" && filteredMembers.length > 0) {
                    addToStaging(filteredMembers[0].id);
                }
            }}
        />
        {#if search}
            <ul
                class={[
                    "z-10 flex flex-col shadow absolute top-11 inset-x-0",
                    "border border-t-0 border-surface-border rounded-b-2xs"
                ]}
            >
                {#each filteredMembers.slice(0, 5) as member}
                    {@render searchSuggestion(member)}
                {:else}
                    <span
                        class={[
                            "flex items-center gap-1.5 h-11 px-2.5",
                            "bg-surface text-md-regular text-on-surface-muted ITALIC"
                        ]}
                    >
                        Не найдено
                    </span>
                {/each}
            </ul>
        {/if}
    </section>

    {#snippet searchSuggestion(member: Student | StaffMember)}
        {@const alreadyAttended = attendees.some(a => a.userId === member.id)}
        <button
            class={[
                "flex items-center gap-1.5 h-11 px-2.5",
                "text-md-regular text-nowrap overflow-ellipsis outline-0",
                "bg-surface",
                !alreadyAttended
                    ? "hover:bg-on-primary focus:bg-on-primary"
                    : "cursor-not-allowed"
            ]}
            onclick={() => addToStaging(member.id)}
            disabled={alreadyAttended}
        >
            <div
                class="cover size-[24px] text-sm-regular rounded-2xs"
                style:background-image={member.avatar
                    ? `url(${userFilePath(member.id).avatar(member.avatar)})`
                    : null}
            >
                <span>{member.tgUsername[0]}</span>
            </div>
            <span>{member.firstName} {member.lastName},</span>
            <span class="text-on-surface-muted">
                @{member.tgUsername}
            </span>
            {#if alreadyAttended}
                <span class="ml-auto text-sm-medium text-on-surface-muted">
                    Уже отмечен(а)
                </span>
            {/if}
        </button>
    {/snippet}
{/snippet}

{#snippet stagingSection()}
    <ul class="flex-1 flex flex-col gap-5 overflow-y-auto">
        {#each stagedUsers as stagedUser}
            {@const member = getMember(stagedUser.id)}
            <li class="flex">
                <div class="flex gap-2">
                    <div
                        class="cover size-[50px] text-md-regular rounded-xs"
                        style:background-image={member?.avatar
                            ? `url(${userFilePath(member.id).avatar(
                                  member.avatar
                              )})`
                            : null}
                    >
                        <span>{member?.tgUsername[0] ?? "?"}</span>
                    </div>
                    <div class="flex flex-col justify-between">
                        <span class="text-xl-medium">
                            {member?.firstName ?? "Неизвестный"}
                            {member?.lastName}
                        </span>
                        <span class="text-md-regular">
                            @{member?.tgUsername ?? "durov"}
                        </span>
                    </div>
                </div>
                {#if member}
                    <label class="ml-auto mr-4 flex gap-2">
                        <select
                            class="text-lg-medium"
                            bind:value={stagedUser.format}
                        >
                            <option value="offline">Офлайн</option>
                            <option value="online">Онлайн</option>
                        </select>
                    </label>
                    <button
                        class="btn secondary"
                        onclick={() => {
                            if (!member) return;
                            stagedUsers = stagedUsers.filter(
                                stagedUser => stagedUser.id !== member.id
                            );
                        }}
                    >
                        Удалить
                    </button>
                {/if}
            </li>
        {:else}
            <div
                class="max-w-[400px] text-md-regular text-on-surface-muted text-center text-balance m-auto"
            >
                Отметьте посетивших урок студентов и участвовавших в его
                проведении преподавателей.
            </div>
        {/each}
    </ul>
{/snippet}
