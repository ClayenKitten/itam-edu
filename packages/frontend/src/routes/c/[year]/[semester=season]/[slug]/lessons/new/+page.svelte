<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import { coursePath } from "$lib/path.js";
    import HomeworksSection from "../[lessonId]/edit/HomeworksSection.svelte";
    import ContentSection from "../[lessonId]/edit/ContentSection.svelte";
    import InfoSection from "../[lessonId]/edit/InfoSection.svelte";
    import api, { UploadClient } from "$lib/api";
    import ScheduleSection from "../[lessonId]/edit/ScheduleSection.svelte";
    import VideoSection from "../[lessonId]/edit/VideoSection.svelte";
    import { getToaster } from "$lib/Toaster.svelte";
    import type { LessonSchedule } from "$lib/types";
    import AsyncButton from "$lib/components/AsyncButton.svelte";

    let { data } = $props();
    const toaster = getToaster();

    let title: string = $state("");
    let description: string | null = $state(null);
    let content: string | null = $state(null);
    let homeworkIds: string[] = $state([]);
    let schedule: LessonSchedule | null = $state(null);

    let uploadVideoFile: File | null = $state(null);
    let uploadBannerFile: File | null = $state(null);

    async function create() {
        if (title.length < 3) {
            toaster.add("Слишком короткое название урока", "error");
            return;
        }

        // Create lesson
        const result = await api({ fetch })
            .courses({ course: data.course.id })
            .lessons.post({
                lesson: {
                    title,
                    description,
                    content,
                    homeworkIds,
                    schedule
                }
            });
        if (result.error) {
            toaster.add("Не удалось опубликовать урок", "error");
            return;
        }

        // Upload files
        // FIXME: double request is really bad, we need to find a better solution
        try {
            const fileClient = new UploadClient({ fetch });
            let banner: string | null = null;
            if (uploadBannerFile) {
                banner = await fileClient.uploadLessonFile(
                    data.course.id,
                    result.data.id,
                    "cover",
                    uploadBannerFile
                );
            }
            let video: string | null = null;
            if (uploadVideoFile) {
                video = await fileClient.uploadLessonFile(
                    data.course.id,
                    result.data.id,
                    "video",
                    uploadVideoFile
                );
            }
            const result2 = await api({ fetch })
                .courses({ course: data.course.id })
                .lessons({ lesson: result.data.id })
                .patch({ banner, video });
            if (result2.error) {
                toaster.add("Не удалось сохранить файлы урока", "error");
                return;
            }
        } catch (e) {
            toaster.add("Не удалось сохранить файлы урока", "error");
            return;
        }

        await invalidateAll();
        await goto(`${coursePath(data.course)}/lessons/${result.data.id}`);
    }
</script>

<div
    class={[
        "flex flex-col h-full py-10 gap-7",
        "max-w-[1000px] mx-10 @min-[1200px]/main:mx-40"
    ]}
>
    <InfoSection
        position={null}
        bind:title
        bind:description
        {schedule}
        banner={null}
        onBannerChange={file => {
            uploadBannerFile = file;
        }}
    />
    <ScheduleSection bind:schedule />
    <VideoSection
        course={data.course}
        video={null}
        onUploaded={file => {
            uploadVideoFile = file;
        }}
        onDeleted={() => {
            uploadVideoFile = null;
        }}
    />
    <ContentSection bind:content />
    <HomeworksSection course={data.course} bind:homeworkIds />
    <footer class="flex justify-end gap-2.5">
        <a
            class="btn secondary shadow"
            href="{coursePath(data.course)}/lessons"
        >
            Отмена
        </a>
        <AsyncButton class="btn shadow" onclick={create}>
            Опубликовать
            {#snippet loading()}
                Публикуем...
            {/snippet}
        </AsyncButton>
    </footer>
</div>
