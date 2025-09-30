<script lang="ts">
    import VideoUploader from "$lib/components/upload/VideoUploader.svelte";
    import { filePath } from "$lib/path";
    import type { Course } from "$lib/types";

    let { video, onUploaded, onDeleted }: Props = $props();

    type Props = {
        course: Course;
        video: string | null;
        onUploaded: (file: File) => void;
        onDeleted: () => void;
    };
</script>

<section
    class="flex flex-col justify-between gap-6 p-7.5 rounded-xl bg-surface shadow"
>
    <header class="flex flex-col gap-1">
        <h3>Видеозапись</h3>
        <p class="text-md-regular text-on-surface-muted">
            Загрузите видеозапись прошедшего занятия.
        </p>
    </header>
    <div class="flex items-center gap-4">
        <VideoUploader
            url={video ? filePath(video) : null}
            {onUploaded}
            {onDeleted}
        />
    </div>
</section>
