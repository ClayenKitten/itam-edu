<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import type { Course, Invite, StaffMember } from "$lib/types";
    import CreateInviteModal from "./CreateInviteModal.svelte";
    import { formatDistanceToNowStrict } from "date-fns";
    import { ru } from "date-fns/locale";
    import { getToaster } from "$lib/Toaster.svelte";
    import { page } from "$app/state";
    import { filePath } from "$lib/path";

    const { course, staff, invites }: Props = $props();
    interface Props {
        course: Course;
        staff: StaffMember[];
        invites: Invite[] | null;
    }
    const toaster = getToaster();
    let inviteModal: CreateInviteModal;

    const changeRole = async (
        staffMember: StaffMember,
        role: "admin" | "teacher"
    ) => {
        if (staffMember.role === role) {
            return;
        }

        const roleName = role === "admin" ? "администратора" : "преподавателя";
        if (
            !confirm(
                `Вы уверены, что хотите назначить @${staffMember.tgUsername} на роль ${roleName}?`
            )
        ) {
            return;
        }

        const result = await api({ fetch })
            .courses({ course: course.id })
            .staff({ staffMember: staffMember.id })
            .put({ role });
        if (result.error) {
            toaster.add("Не удалось изменить роль", "error");
            return false;
        }
        await invalidate("app:course");
    };

    const remove = async (staffMember: StaffMember) => {
        if (
            !confirm(
                `Вы уверены, что хотите удалить @${staffMember.tgUsername} из курса?`
            )
        ) {
            return;
        }
        const result = await api({ fetch })
            .courses({ course: course.id })
            .staff({ staffMember: staffMember.id })
            .delete();
        if (result.error) {
            toaster.add("Не удалось удалить пользователя", "error");
            return;
        }
        await invalidate("app:course");
    };
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <header>
        <h3>Коллектив</h3>
    </header>
    <ul class="w-full flex flex-col gap-4">
        {#each staff as staffMember}
            {@render staffMemberCard(staffMember)}
        {/each}
        {#if invites}
            {#each invites as invite}
                {@render inviteCard(invite)}
            {/each}
        {/if}
        {#if course.permissions.staff.manage === true}
            <button class="btn self-start" onclick={() => inviteModal.show()}>
                <i class="ph ph-plus"></i>
                Пригласить
            </button>
        {/if}
    </ul>
    <CreateInviteModal {course} bind:this={inviteModal} />
</section>

{#snippet staffMemberCard(staffMember: StaffMember)}
    <li class={["flex items-center gap-4 p-2 rounded-md shadow"]}>
        <div
            class="cover size-16 text-md-regular rounded-2xs"
            style:background-image={staffMember.avatar
                ? `url(${filePath(staffMember.avatar)})`
                : null}
        >
            {staffMember.tgUsername[0]}
        </div>
        <header
            class="flex flex-col gap-1 justify-center items-start overflow-hidden"
        >
            <h4 class="flex gap-2 text-on-surface-contrast text-nowrap">
                <span>
                    {staffMember.firstName}
                    {staffMember.lastName}
                </span>
                <div
                    class={[
                        "px-3 py-1",
                        "bg-on-primary text-primary text-sm-regular",
                        "rounded-xs"
                    ]}
                >
                    {#if staffMember.id === course.ownerId}
                        Владелец
                    {:else if staffMember.role === "admin"}
                        Администратор
                    {:else if staffMember.role === "teacher"}
                        Преподаватель
                    {/if}
                </div>
            </h4>
            <a
                class="text-primary text-md-regular hover:underline"
                href={`https://t.me/${staffMember.tgUsername}`}
                target="_blank"
            >
                @{staffMember.tgUsername}
            </a>
        </header>
        {#if course.permissions.staff.manage === true && staffMember.id !== course.ownerId}
            <div class="group relative size-12 ml-auto">
                <button
                    class={[
                        "size-12 flex justify-center items-center",
                        "bg-surface hover:bg-surface-tint rounded-xs"
                    ]}
                    aria-label="Меню"
                    onclick={() => {}}
                >
                    <i class="ph ph-dots-three-outline-vertical text-[20px]"
                    ></i>
                </button>
                <menu
                    class={[
                        "not-group-focus-within:hidden context-menu absolute top-12 right-0 z-10"
                    ]}
                >
                    {#if staffMember.role !== "admin"}
                        <button
                            class="context-menu-item"
                            onclick={() => changeRole(staffMember, "admin")}
                        >
                            <i class="ph ph-shield-checkered"></i>
                            Назначить администратором
                        </button>
                    {/if}
                    {#if staffMember.role !== "teacher"}
                        <button
                            class="context-menu-item"
                            onclick={() => changeRole(staffMember, "teacher")}
                        >
                            <i class="ph ph-chalkboard-teacher"></i>
                            Назначить преподавателем
                        </button>
                    {/if}
                    <button
                        class="context-menu-item"
                        onclick={() => remove(staffMember)}
                    >
                        <i class="ph ph-trash"></i>
                        Удалить из курса
                    </button>
                </menu>
            </div>
        {/if}
    </li>
{/snippet}

{#snippet inviteCard(invite: Invite)}
    <li class={["flex items-center gap-4 p-2 rounded-md shadow"]}>
        <div
            class={[
                "flex justify-center items-center size-16",
                "text-primary bg-on-primary rounded-2xs"
            ]}
        >
            <i class="ph ph-user-plus text-[24px]"></i>
        </div>
        <header
            class="flex flex-col gap-1 justify-center items-start overflow-hidden"
        >
            <h4 class="flex gap-2 text-on-surface-contrast text-nowrap">
                <span>Приглашение</span>
                <div
                    class={[
                        "px-3 py-1",
                        "bg-on-primary text-primary text-sm-regular",
                        "rounded-xs"
                    ]}
                >
                    {#if invite.role === "admin"}
                        Администратор
                    {:else if invite.role === "teacher"}
                        Преподаватель
                    {/if}
                </div>
            </h4>
            <span class="text-on-surface-muted text-md-regular">
                Истекает через {formatDistanceToNowStrict(
                    new Date(invite.expiresAt),
                    { locale: ru }
                )}
            </span>
        </header>
        <div class="group relative size-12 ml-auto">
            <button
                class={[
                    "size-12 flex justify-center items-center",
                    "bg-surface hover:bg-surface-tint rounded-xs"
                ]}
                aria-label="Меню"
                onclick={() => {}}
            >
                <i class="ph ph-dots-three-outline-vertical text-[20px]"></i>
            </button>
            <menu
                class={[
                    "not-group-focus-within:hidden context-menu absolute top-12 right-0 z-10"
                ]}
            >
                <button
                    class="context-menu-item"
                    onclick={e => {
                        const url = page.url.origin + `?invite=${invite.code}`;
                        window.navigator.clipboard.writeText(url);
                        toaster.add("Ссылка-приглашение скопирована");
                        e.currentTarget.blur();
                    }}
                >
                    <i class="ph ph-copy"></i>
                    Скопировать ссылку
                </button>
                <button
                    class="context-menu-item"
                    onclick={async () => {
                        const result = await api({ fetch })
                            .courses({ course: course.id })
                            .invites({ code: invite.code })
                            .delete();
                        if (result.error) {
                            toaster.add(
                                "Не удалось удалить приглашение",
                                "error"
                            );
                        } else {
                            toaster.add("Приглашение удалено");
                            await invalidate("app:invites");
                        }
                    }}
                >
                    <i class="ph ph-trash"></i>
                    Удалить приглашение
                </button>
            </menu>
        </div>
    </li>
{/snippet}
