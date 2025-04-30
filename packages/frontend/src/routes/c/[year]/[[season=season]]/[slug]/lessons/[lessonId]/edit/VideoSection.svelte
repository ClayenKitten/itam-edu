<script lang="ts">
    import VideoUploader from "$lib/components/upload/VideoUploader.svelte";
    import type { Course } from "$lib/types";
    import { courseFilePath } from "itam-edu-common";

    let { course, video, onUploaded, onDeleted }: Props = $props();

    type Props = {
        course: Course;
        video: string | null;
        onUploaded: (file: File) => void;
        onDeleted: () => void;
    };
</script>

<section
    class="flex flex-col justify-between gap-4 p-7.5 rounded-xl bg-surface shadow"
>
    <header class="flex flex-col gap-2">
        <h3>Видеозапись</h3>
        <p class="max-w-[800px] text-balance">
            Загрузите видеозапись прошедшего занятия. Если вы проведёте
            трансляцию на платформе, то видеозапись будет загружена
            автоматически.
        </p>
    </header>
    <div class="flex items-center gap-4">
        <VideoUploader
            url={video ? courseFilePath(course.id).public(video) : null}
            {onUploaded}
            {onDeleted}
        />
    </div>
</section>
