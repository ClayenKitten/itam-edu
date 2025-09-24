<script lang="ts">
    import { dismissable } from "$lib/attachments/dismissable.svelte";

    let {
        url,
        onChange,
        aspectRatio = "1/1",
        size = "cover",
        height = "auto",
        width = "auto",
        readonly = false
    }: Props = $props();

    type Props = {
        /** URL of the initiailly uploaded file, if any. */
        url: string | null;
        onChange: (file: File | null) => void | Promise<void>;
        height?: `${number}px` | `${number}%` | "auto" | null;
        width?: `${number}px` | `${number}%` | "auto" | null;
        /** Aspect ratio of the uploaded image. */
        aspectRatio?: string;
        /**
         * How to size the uploaded image.
         * See https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
         * */
        size?: "contain" | "cover";
        readonly?: boolean;
    };

    let objectUrl: string | null = $state(null);
    let isDeleted = $state(false);
    let src = $derived(isDeleted ? null : (objectUrl ?? url));

    function uploadImage(file: File) {
        menuCoords = null;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = URL.createObjectURL(file);
        isDeleted = false;
        onChange?.(file);
    }
    function deleteImage() {
        menuCoords = null;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        isDeleted = true;
        onChange?.(null);
    }

    let menuCoords: { x: number; y: number } | null = $state(null);
</script>

<div
    class="group relative"
    style:height
    style:width
    style:aspect-ratio={aspectRatio}
>
    <label
        class={[
            "size-full flex justify-center items-center overflow-hidden",
            "border-2 rounded-sm",
            !readonly
                ? "border-primary-border focus-within:border-primary"
                : "border-surface-border",
            "bg-center bg-origin-border",
            size === "cover" ? "bg-cover" : "bg-contain bg-no-repeat"
        ]}
        style:background-image={src ? `url(${src})` : null}
    >
        {#if src === null}
            <label
                class={[
                    "size-full flex items-center justify-center",
                    "bg-on-primary text-primary",
                    readonly ? "cursor-default" : "cursor-pointer"
                ]}
            >
                <div
                    class={[
                        "flex items-center justify-center size-[46px]",
                        "bg-on-primary text-primary",
                        !readonly && [
                            "group-hover:bg-primary group-hover:text-on-primary",
                            "group-focus-within:bg-primary group-focus-within:text-on-primary"
                        ],
                        "rounded-full",
                        "transition-colors duration-200"
                    ]}
                >
                    {#if !readonly}
                        <i class="ph ph-upload-simple text-[20px]"></i>
                    {:else}
                        <i class="ph ph-prohibit text-[20px]"></i>
                    {/if}
                </div>
                {@render fileSelector()}
            </label>
        {:else}
            <button
                class={[
                    "size-full text-xl-medium rounded-sm",
                    readonly ? "cursor-default" : "cursor-pointer",
                    src === null
                        ? "bg-on-primary text-primary"
                        : "bg-transparent"
                ]}
                onclick={e => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    menuCoords = {
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top
                    };
                }}
                disabled={readonly}
            >
                {#if src === null}{/if}
            </button>
        {/if}
    </label>
    {#if menuCoords}
        <menu
            class="context-menu absolute"
            style:left="{menuCoords.x}px"
            style:top="{menuCoords.y}px"
            {@attach dismissable(() => (menuCoords = null))}
        >
            <label class="context-menu-item">
                <i class="ph ph-pencil-simple"></i>
                <span class="h-4.5">Выбрать фото</span>
                {@render fileSelector()}
            </label>
            <button class="context-menu-item" onclick={deleteImage}>
                <i class="ph ph-trash"></i>
                <span>Удалить</span>
            </button>
        </menu>
    {/if}
</div>

{#snippet fileSelector()}
    <input
        class="size-0 outline-0"
        type="file"
        accept="image/png,image/jpeg"
        onchange={async e => {
            const file = e.currentTarget.files?.item(0);
            if (file) uploadImage(file);
        }}
        oncancel={() => {
            menuCoords = null;
        }}
        disabled={readonly}
    />
{/snippet}
