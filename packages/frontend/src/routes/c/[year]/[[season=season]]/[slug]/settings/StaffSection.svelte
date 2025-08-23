<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import type { Course, StaffMember } from "$lib/types";
    import { userFilePath } from "itam-edu-common";

    const { course, staff, readonly }: Props = $props();
    interface Props {
        course: Course;
        staff: StaffMember[];
        readonly: boolean;
    }

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
            alert(result.status);
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
            alert(result.status);
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
    </ul>
</section>

{#snippet staffMemberCard(staffMember: StaffMember)}
    <li class={["flex items-center gap-4 p-2 rounded-md shadow"]}>
        <div
            class="flex justify-center items-center w-16 h-16 overflow-hidden rounded-2xs bg-primary"
            aria-hidden="true"
        >
            {#if staffMember.avatar}
                <img
                    src={userFilePath(staffMember.id).avatar(
                        staffMember.avatar
                    )}
                    alt=""
                />
            {:else}
                <span class="text-on-primary text-md-medium">
                    {staffMember.tgUsername[0]}
                </span>
            {/if}
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
        {#if !readonly && staffMember.id !== course.ownerId}
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
