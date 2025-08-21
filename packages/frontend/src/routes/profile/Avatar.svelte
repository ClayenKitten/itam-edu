<script lang="ts">
    import api from "$lib/api";
    import { dismissable } from "$lib/attachments/dismissable.svelte";
    import { userFilePath, type User } from "itam-edu-common";

    let { user, avatar, onchange }: Props = $props();

    type Props = {
        user: User;
        avatar: string | null;
        onchange?: (avatar: string | null) => void;
    };

    let menuCoords: { x: number; y: number } | null = $state(null);

    const upload = async (file: File) => {
        const response = await api({ fetch })
            .files.users({ user: user.id })
            .avatar.post({ file });
        if (response.error) {
            alert(response.status);
            return null;
        }
        const { filename } = response.data;
        onchange?.(filename);
    };
</script>

<div class="relative size-40">
    <button
        class="size-40 bg-primary rounded-2xl overflow-hidden"
        onclick={e => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            menuCoords = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }}
        aria-label="Аватар"
    >
        {#if avatar}
            <img src={userFilePath(user.id).avatar(avatar)} alt="" />
        {:else}
            <span class="text-on-primary text-xl-medium">
                {user.displayName[0]}
            </span>
        {/if}
    </button>
    {#if menuCoords}
        <menu
            class="context-menu absolute"
            style:left="{menuCoords.x}px"
            style:top="{menuCoords.y}px"
            {@attach dismissable(() => (menuCoords = null))}
        >
            <label
                class={[
                    "context-menu-item",
                    "bg-surface hover:bg-surface-tint",
                    "transition duration-100"
                ]}
            >
                <i class="ph ph-pencil-simple"></i>
                <span class="h-4.5">Выбрать фото</span>
                <input
                    class="size-0 outline-0"
                    type="file"
                    accept="image/png,image/jpeg"
                    onchange={async e => {
                        const file = e.currentTarget.files?.item(0);
                        if (file) await upload(file);
                        menuCoords = null;
                    }}
                    oncancel={() => {
                        menuCoords = null;
                    }}
                />
            </label>
            {#if avatar}
                <button
                    class="context-menu-item"
                    onclick={() => onchange?.(null)}
                >
                    <i class="ph ph-trash"></i>
                    <span>Удалить</span>
                </button>
            {/if}
        </menu>
    {/if}
</div>
