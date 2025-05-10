<script lang="ts">
    import { userFilePath } from "itam-edu-common";

    let { staff = $bindable(), readonly }: Props = $props();

    interface Props {
        staff: {
            user: {
                id: string;
                avatar: string | null;
                firstName: string | null;
                lastName: string | null;
                tgUsername: string;
            };
            title: string | null;
        }[];
        readonly: boolean;
    }
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <header>
        <h3>Коллектив</h3>
    </header>
    <ul class="w-full flex flex-col gap-4">
        {#each staff as staffMember}
            <details class="flex gap-4 p-2 rounded-md shadow">
                <summary
                    class={[
                        "group flex gap-4 items-center p-2 rounded-xs",
                        !readonly ? "cursor-pointer hover:bg-surface-tint" : ""
                    ]}
                >
                    <div
                        class="flex justify-center items-center w-16 h-16 overflow-hidden rounded-2xs bg-primary"
                        aria-hidden="true"
                    >
                        {#if staffMember.user.avatar}
                            <img
                                src={userFilePath(staffMember.user.id).avatar(
                                    staffMember.user.avatar
                                )}
                                alt=""
                            />
                        {:else}
                            <span class="text-on-primary text-comment">
                                {staffMember.user.tgUsername[0]}
                            </span>
                        {/if}
                    </div>

                    <header
                        class="flex flex-col justify-center items-start overflow-hidden"
                    >
                        <h3 class="text-nowrap">
                            {#if staffMember.user.firstName}
                                {staffMember.user.firstName}
                                {staffMember.user.lastName}
                            {:else}
                                {staffMember.user.tgUsername}
                            {/if}
                        </h3>
                        <a
                            class="text-primary text-date hover:underline"
                            href={`https://t.me/${staffMember.user.tgUsername}`}
                        >
                            @{staffMember.user.tgUsername}
                        </a>
                    </header>
                    {#if !readonly}
                        <i
                            class="ph-fill ph-caret-down ml-auto mr-4 text-on-surface-muted group-hover:text-on-surface-contrast text-[24px] group-open:hidden"
                        ></i>
                        <i
                            class="ph-fill ph-caret-up ml-auto mr-4 text-on-surface-muted group-hover:text-on-surface-contrast text-[24px] not-group-open:hidden"
                        ></i>
                    {/if}
                </summary>
                {#if !readonly}
                    <hr class="mt-4 text-surface-border" />
                    <div class="flex flex-col gap-8 p-4">
                        <label class="flex flex-col gap-2">
                            <h4>Роль</h4>
                            <input
                                class="input"
                                bind:value={staffMember.title}
                            />
                        </label>
                    </div>
                {/if}
            </details>
        {/each}
    </ul>
</section>
