<script lang="ts">
    import { UploadClient } from "$lib/api";
    import { dismissable } from "$lib/attachments/dismissable.svelte";
    import { filePath } from "$lib/path";
    import type { User } from "itam-edu-common";

    let { user, avatar, onchange }: Props = $props();

    type Props = {
        user: User;
        avatar: string | null;
        onchange?: (avatar: string | null) => void;
    };

    let menuCoords: { x: number; y: number } | null = $state(null);

    let key: string | null = $state(null); // Key for cache-busting on update
    let url = $derived.by(() => {
        if (avatar === null) return null;
        return filePath(avatar) + (key ? `?key=${key}` : "");
    });
    const upload = async (file: File) => {
        const client = new UploadClient({ fetch });
        try {
            const filename = await client.uploadAvatar(user.id, file);
            onchange?.(filename);
        } catch (e) {
            alert("Не удалось сохранить аватар.");
        }
        key = crypto.randomUUID().slice(0, 6);
    };
</script>

<div class="relative size-40">
    <button
        class="cover size-40 bg-primary rounded-2xl overflow-hidden text-on-primary text-xl-medium"
        style:background-image={avatar ? `url(${url})` : null}
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
        {user.telegram.username[0]}
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
