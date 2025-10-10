<script lang="ts">
    import { filePath } from "$lib/path";
    import { getFileIcon } from "$lib/utils/fileIcon";

    const { file, onDelete }: Props = $props();
    type Props = {
        /** Uploaded file or URL. */
        file: File | string;
        onDelete?: () => void;
    };

    let objectUrl = $state<string | null>(null);
    let url = $derived(file instanceof File ? objectUrl : filePath(file));

    let filename = $derived(
        file instanceof File ? file.name : filePath(file).split("/").pop()!
    );
    let icon = $derived(getFileIcon(filename));

    $effect(() => {
        if (!(file instanceof File)) return;
        objectUrl = URL.createObjectURL(file);

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    });
</script>

<li
    class={[
        "h-11 w-max px-2",
        "flex gap-2 items-center",
        "bg-surface-tint text-on-surface",
        "border border-surface-border rounded-2xs",
        "text-nowrap"
    ]}
>
    <a
        class="group/file flex items-center gap-2 text-primary max-w-60 overflow-hidden"
        href={url}
        target="_blank"
        download
    >
        {#key icon}
            <i class={`ph-fill ph-${icon} text-[22px]`}></i>
        {/key}
        <span
            class="group-hover/file:underline overflow-hidden text-ellipsis min-w-0"
        >
            {filename}
        </span>
    </a>
    {#if onDelete}
        <button
            class="shrink-0 size- p-1 rounded-full bg-surface-tint hover:bg-surface-dimmed"
            aria-label="Удалить"
            onclick={() => onDelete()}
        >
            <i class="ph ph-x text-[15px]"></i>
        </button>
    {/if}
</li>
