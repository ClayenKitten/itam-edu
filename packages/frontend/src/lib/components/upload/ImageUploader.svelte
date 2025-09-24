<script lang="ts">
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
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = URL.createObjectURL(file);
        isDeleted = false;
        onChange?.(file);
    }
    function deleteImage() {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        isDeleted = true;
        onChange?.(null);
    }
</script>

<label
    class={[
        "group relative flex justify-center items-center",
        "border-2 rounded-sm overflow-hidden",
        !readonly
            ? "border-primary-border focus-within:border-primary cursor-pointer"
            : "border-surface-border",
        "bg-center bg-origin-border",
        size === "cover" ? "bg-cover" : "bg-contain bg-no-repeat"
    ]}
    style:height
    style:width
    style:background-image={src ? `url(${src})` : null}
    style:aspect-ratio={aspectRatio}
>
    {#if !readonly}
        {@render fileInput()}
    {/if}
    {#if src && !readonly}
        <button
            class={[
                "absolute top-4 right-4 flex items-center justify-center h-[46px] w-[46px]",
                "rounded-full bg-primary text-on-primary hover:bg-on-primary hover:text-primary",
                "transition-colors duration-100"
            ]}
            onclick={deleteImage}
            aria-label="Удалить"
        >
            <i class="ph ph-trash text-[20px]"></i>
        </button>
    {:else if !readonly}
        <div
            class={[
                "flex items-center justify-center h-[46px] w-[46px]",
                "rounded-full",
                !readonly
                    ? "bg-primary text-on-primary group-hover:bg-on-primary group-hover:text-primary"
                    : "bg-on-surface-muted text-on-primary",
                "transition-colors duration-100"
            ]}
        >
            {#if !readonly}
                <i class="ph ph-upload-simple text-[20px]"></i>
            {:else}
                <i class="ph ph-prohibit text-[20px]"></i>
            {/if}
        </div>
    {/if}
</label>

{#snippet fileInput()}
    <input
        type="file"
        class="hidden"
        accept="image/png,image/jpeg"
        onchange={async e => {
            const file = (e.target! as HTMLInputElement).files?.item(0);
            if (!file) return;
            uploadImage(file);
        }}
    />
{/snippet}
