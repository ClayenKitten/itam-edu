<script lang="ts">
    let { url, onUploaded, onDeleted }: Props = $props();

    type Props = {
        url: string | null;
        onUploaded?: (file: File) => void;
        onDeleted?: () => void;
    };

    let objectUrl: string | null = $state(null);
    let isDeleted = $state(false);

    let src = $derived(isDeleted ? null : (objectUrl ?? url));

    function uploadVideo(file: File) {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = URL.createObjectURL(file);
        isDeleted = false;
        onUploaded?.(file);
    }
    function deleteVideo() {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        isDeleted = true;
        onDeleted?.();
    }
</script>

{#if src === null}
    <label class="btn">
        <i class="ph ph-upload-simple text-[18px]"></i>
        Загрузить видео
        {@render fileInput()}
    </label>
{:else}
    <div class="relative">
        <!-- svelte-ignore a11y_media_has_caption -->
        <video
            class="max-h-150 shadow rounded-xs"
            {src}
            controls
            preload="metadata"
        ></video>
        <menu class="absolute top-4 right-4 flex gap-2">
            <label
                class={[
                    "flex items-center justify-center h-[46px] w-[46px] cursor-pointer",
                    "rounded-full bg-primary text-on-primary hover:bg-on-primary hover:text-primary",
                    "transition-colors duration-100"
                ]}
                title="Загрузить новое"
                aria-label="Загрузить новое"
            >
                <i class="ph ph-pencil-simple text-[20px]"></i>
                {@render fileInput()}
            </label>
            <button
                class={[
                    "flex items-center justify-center h-[46px] w-[46px]",
                    "rounded-full bg-primary text-on-primary hover:bg-on-primary hover:text-primary",
                    "transition-colors duration-100"
                ]}
                onclick={deleteVideo}
                title="Удалить"
                aria-label="Удалить"
            >
                <i class="ph ph-trash text-[20px]"></i>
            </button>
        </menu>
    </div>
{/if}

{#snippet fileInput()}
    <input
        type="file"
        class="hidden"
        accept="video/mp4,video/webm"
        onchange={async e => {
            const file = (e.target! as HTMLInputElement).files?.item(0);
            if (!file) return;
            uploadVideo(file);
        }}
    />
{/snippet}
