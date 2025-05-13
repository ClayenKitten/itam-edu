<script lang="ts">
    let {
        filename = $bindable(null),
        filenameToSrc,
        onUpload,
        aspectRatio = "1/1"
    }: Props = $props();

    type Props = {
        filename: string | null;
        filenameToSrc: (filename: string) => string;
        onUpload: (file: File) => Promise<string | null>;
        aspectRatio?: string;
        maxHeight?: `${number}px` | null;
    };
</script>

<div
    class={[
        "w-full h-full",
        "group relative flex justify-center items-center cursor-pointer",
        "border-2 border-on-primary rounded-sm overflow-hidden focus-within:border-primary"
    ]}
    style:aspect-ratio={aspectRatio}
>
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
    {#if filename}
        <img
            class="h-full w-full object-cover object-center"
            src={filenameToSrc(filename)}
            alt=""
        />
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
    {:else}
        <div
            class={[
                "flex items-center justify-center h-[46px] w-[46px]",
                "rounded-full bg-primary text-on-primary group-hover:bg-on-primary group-hover:text-primary",
                "transition-colors duration-100"
            ]}
        >
            <i class="ph ph-upload-simple text-[20px]"></i>
        </div>
    {/if}
</div>
