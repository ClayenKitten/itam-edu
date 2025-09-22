<script lang="ts">
    import api from "$lib/api";
    import PlainEditor from "$lib/components/editor/PlainEditor.svelte";
    import ImageUploader from "$lib/components/upload/ImageUploader.svelte";
    import { formatLessonSchedule } from "$lib/format";
    import type { Course, CreateLesson, Lesson } from "$lib/types";
    import { courseFilePath } from "itam-edu-common";

    let { course, lesson = $bindable() }: Props = $props();

    type Props = {
        course: Course;
        lesson: Lesson | CreateLesson;
    };
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <header class="flex flex-col gap-2">
        {#if "position" in lesson}
            <h2>Урок {lesson.position + 1}</h2>
        {:else}
            <h2>Новый урок</h2>
        {/if}
        {#if lesson.schedule}
            <p class="text-md-regular text-on-surface-muted">
                {formatLessonSchedule(lesson.schedule)}
            </p>
        {/if}
    </header>
    <label class="flex flex-col gap-2">
        <h4>Название</h4>
        <input class="input" bind:value={lesson.title} />
    </label>
    <div class="flex flex-wrap gap-6">
        <label class="flex-1 flex flex-col gap-2 min-w-[min(100%,400px)]">
            <h4>Описание</h4>
            <div class="flex-1 min-h-[200px] max-h-[200px]">
                <PlainEditor
                    bind:content={lesson.description}
                    characterLimit={300}
                />
            </div>
        </label>
        <label class="shrink-0 flex flex-col gap-2">
            <h4>Обложка</h4>
            <div class="h-[200px]">
                <ImageUploader
                    bind:filename={lesson.banner}
                    aspectRatio="320/200"
                    height="200px"
                    filenameToSrc={filename =>
                        courseFilePath(lesson.courseId, filename)}
                    onUpload={async file => {
                        const response = await api({ fetch })
                            .files.courses({ course: course.id })
                            .post({ file });
                        if (response.error) {
                            alert(response.status);
                            return null;
                        }
                        const { filename } = response.data;
                        return filename;
                    }}
                />
            </div>
        </label>
    </div>
</section>
