<script lang="ts">
    let {
        filename = $bindable(null),
        filenameToSrc,
        onUpload,
        aspectRatio = "1/1",
        size = "cover",
        height = "auto",
        width = "auto",
        readonly = false
    }: Props = $props();

    type Props = {
        filename: string | null;
        filenameToSrc: (filename: string) => string;
        onUpload: (file: File) => Promise<string | null>;
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
</script>

<label
    class={[
        "group relative flex justify-center items-center",
        "border-2 rounded-sm overflow-hidden",
        !readonly
            ? "border-on-primary focus-within:border-primary cursor-pointer"
            : "border-surface-border",
        "bg-center bg-origin-border",
        size === "cover" ? "bg-cover" : "bg-contain bg-no-repeat"
    ]}
    style:height
    style:width
    style:background-image={filename ? `url(${filenameToSrc(filename)})` : null}
    style:aspect-ratio={aspectRatio}
>
    {#if !readonly}
        <input
            class="h-0 w-0 outline-0"
            type="file"
            accept="image/png,image/jpeg"
            onchange={async e => {
                const file = (e.target! as HTMLInputElement).files?.item(0);
                if (file) {
                    let newFilename = await onUpload(file);
                    if (newFilename) filename = newFilename;
                }
            }}
        />
    {/if}
    {#if filename && !readonly}
        <button
            class={[
                "absolute top-4 right-4 flex items-center justify-center h-[46px] w-[46px]",
                "rounded-full bg-primary text-on-primary hover:bg-on-primary hover:text-primary",
                "transition-colors duration-100"
            ]}
            onclick={() => (filename = null)}
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
