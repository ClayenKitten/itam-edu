<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import SuggestionSearch from "$lib/components/SuggestionSearch.svelte";
    import { filePath } from "$lib/path";
    import type {
        Attendee,
        Course,
        Lesson,
        StaffMember,
        Student
    } from "$lib/types";

    const { course, lesson, staff, students, attendees }: Props = $props();
    type Props = {
        course: Course;
        lesson: Lesson;
        staff: StaffMember[];
        students: Student[];
        attendees: Attendee[];
    };

    let query = $state("");
    const members = $derived([...students, ...staff]);

    let stagedUsers: { id: string; format: "online" | "offline" }[] = $state(
        []
    );

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
>
    <header class="flex justify-between">
        <h2>Отметить</h2>
        <button aria-label="Закрыть окно" onclick={() => dialog.close()}>
            <i class="ph ph-x text-[30px]"></i>
        </button>
    </header>
    <SuggestionSearch
        bind:query
        suggestions={members.filter(member => {
            let searchWords = query.trim().toLowerCase().split(" ");
            if (stagedUsers.find(staged => staged.id === member.id)) {
                return false;
            }
            return searchWords.every(searchWord => {
                const match = (s: string) =>
                    s.toLowerCase().includes(searchWord);
                if (match("@" + member.tgUsername)) return true;
                if (match(member.firstName)) return true;
                if (match(member.lastName ?? "")) return true;
                return false;
            });
        })}
        placeholder="Начните вводить имя или Telegram-юзернейм..."
        isSelectable={member => !attendees.some(a => a.userId === member.id)}
        onSelect={member => {
            stagedUsers.push({
                id: member.id,
                format: "offline"
            });
            query = "";
        }}
    >
        {#snippet suggestion(member: Student | StaffMember, { selectable })}
            <div
                class={[
                    "flex items-center gap-1.5 w-full h-11 px-2.5",
                    "text-md-regular text-nowrap overflow-ellipsis outline-0",
                    "bg-surface",
                    selectable
                        ? "hover:bg-on-primary focus:bg-on-primary"
                        : "cursor-not-allowed"
                ]}
            >
                <div
                    class="cover size-[24px] text-sm-regular rounded-2xs"
                    style:background-image={member.avatar
                        ? `url(${filePath(member.avatar)})`
                        : null}
                >
                    <span>{member.tgUsername[0]}</span>
                </div>
                <span class="text-md-regular text-nowrap overflow-ellipsis">
                    {member.firstName}
                    {member.lastName},
                </span>
                <span class="text-on-surface-muted">@{member.tgUsername}</span>
                {#if !selectable}
                    <span class="ml-auto text-sm-medium text-on-surface-muted">
                        Уже отмечен(а)
                    </span>
                {/if}
            </div>
        {/snippet}
        {#snippet empty()}
            <span
                class={[
                    "flex items-center gap-1.5 h-11 px-2.5",
                    "bg-surface text-md-regular text-on-surface-muted ITALIC"
                ]}
            >
                Не найдено
            </span>
        {/snippet}
    </SuggestionSearch>
    {@render stagingSection()}
    <footer class="flex gap-5">
        <button
            class="grow-1 btn big"
            onclick={async () => {
                await save();
                query = "";
                stagedUsers = [];
                dialog.close();
            }}
        >
            Подтвердить
        </button>
    </footer>
</dialog>

{#snippet stagingSection()}
    <ul class="flex-1 flex flex-col gap-5 overflow-y-auto">
        {#each stagedUsers as stagedUser}
            {@const member = members.find(m => m.id === stagedUser.id) ?? null}
            <li class="flex">
                <div class="flex gap-2">
                    <div
                        class="cover size-[50px] text-md-regular rounded-xs"
                        style:background-image={member?.avatar
                            ? `url(${filePath(member.avatar)})`
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
