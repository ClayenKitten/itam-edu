<script lang="ts">
    import Grid from "$lib/components/Grid.svelte";
    import Loader from "$lib/components/Loader.svelte";
    import { formatGlobalRole } from "$lib/format";
    import { filePath } from "$lib/path";
    import type { UserDto } from "itam-edu-api/src/features/users/query";
    import type { User } from "itam-edu-common";

    const { user, users }: Props = $props();
    type Props = {
        user: User;
        users: Promise<UserDto[]>;
    };
</script>

<article class="flex flex-col gap-5 p-6 rounded-lg shadow">
    {#await users}
        <div class="py-40">
            <Loader />
        </div>
    {:then users}
        <Grid
            columns={{
                user: {
                    label: "Имя",
                    size: "minmax(260px, max-content)",
                    cell: userCell,
                    cellClass: "flex gap-2 items-center"
                },
                role: {
                    label: "Роль",
                    size: "max-content",
                    cell: roleCell,
                    cellClass: "text-lg-medium"
                },
                actions: {
                    label: "",
                    size: "1fr",
                    cell: actionsCell,
                    cellClass: "flex justify-end"
                }
            }}
            items={users}
            pageSize={10}
        />
    {/await}
</article>

{#snippet userCell(item: UserDto)}
    <div
        class="cover size-[50px] text-md-regular rounded-xs"
        style:background-image={item.avatar
            ? `url(${filePath(item.avatar)})`
            : null}
    >
        <span>{item.tgUsername?.[0]}</span>
    </div>
    <div class="flex flex-col justify-between">
        <span class="text-xl-medium">
            {item.firstName}
            {item.lastName}
        </span>
        {#if item.tgUsername}
            <a
                class="text-md-regular text-primary hover:underline"
                href={`https://t.me/${item.tgUsername}`}
                target="_blank"
            >
                @{item.tgUsername}
            </a>
        {/if}
    </div>
{/snippet}
{#snippet roleCell(item: UserDto)}
    {formatGlobalRole(item.role)}
{/snippet}
{#snippet actionsCell(item: UserDto)}
    {#if item.id !== user.id}
        <div class="group relative">
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
                        alert("Sorry, not implemented yet!");
                    }}
                >
                    <i class="ph ph-hand-palm"></i>
                    Заблокировать
                </button>
            </menu>
        </div>
    {/if}
{/snippet}
