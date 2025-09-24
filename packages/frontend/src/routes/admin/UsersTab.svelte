<script lang="ts">
    import Loader from "$lib/components/Loader.svelte";
    import { formatGlobalRole } from "$lib/format";
    import { filePath } from "$lib/path";
    import type { UserDto } from "itam-edu-api/src/users/query";
    import type { User } from "itam-edu-common";

    const { user, users }: Props = $props();
    type Props = {
        user: User;
        users: Promise<UserDto[]>;
    };
</script>

<article class="flex flex-col gap-5 p-6 rounded-lg shadow">
    <div
        class={[
            "grid gap-y-4 gap-x-12 items-center",
            "grid-cols-[repeat(2,minmax(100px,max-content))_1fr]"
        ]}
    >
        <div class="text-md-medium text-on-surface-muted">Имя</div>
        <div class="text-md-medium text-on-surface-muted">Роль</div>
        <div></div>
        <hr class="border-surface-border my-1 col-span-full" />
        {#await users}
            <div class="col-span-full py-40">
                <Loader />
            </div>
        {:then users}
            {#each users as curUser (curUser.id)}
                <div class="flex gap-2">
                    <div
                        class="cover size-[50px] text-md-regular rounded-xs"
                        style:background-image={curUser.avatar
                            ? `url(${filePath(curUser.avatar)})`
                            : null}
                    >
                        <span>{curUser.tgUsername[0]}</span>
                    </div>
                    <div class="flex flex-col justify-between">
                        <span class="text-xl-medium">
                            {curUser.firstName}
                            {curUser.lastName}
                        </span>
                        <a
                            class="text-md-regular text-primary hover:underline"
                            href={`https://t.me/${curUser.tgUsername}`}
                            target="_blank"
                        >
                            @{curUser.tgUsername}
                        </a>
                    </div>
                </div>
                <div class="text-lg-medium">
                    {formatGlobalRole(curUser.role)}
                </div>
                <div class="group relative size-12 ml-auto">
                    {#if curUser.id !== user.id}
                        <button
                            class={[
                                "size-12 flex justify-center items-center",
                                "bg-surface hover:bg-surface-tint rounded-xs"
                            ]}
                            aria-label="Меню"
                            onclick={() => {}}
                        >
                            <i
                                class="ph ph-dots-three-outline-vertical text-[20px]"
                            ></i>
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
                    {/if}
                </div>
            {/each}
        {/await}
    </div>
</article>
