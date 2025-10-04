<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import { coursePath } from "$lib/path.js";
    import HomeworksSection from "./HomeworksSection.svelte";
    import ContentSection from "./ContentSection.svelte";
    import InfoSection from "./InfoSection.svelte";
    import api, { UploadClient } from "$lib/api";
    import ScheduleSection from "./ScheduleSection.svelte";
    import equal from "fast-deep-equal";
    import VideoSection from "./VideoSection.svelte";
    import { getToaster } from "$lib/Toaster.svelte";
    import AsyncButton from "$lib/components/AsyncButton.svelte";
    import type { Lesson } from "$lib/types";

    let { data } = $props();
    const toaster = getToaster();

    let lesson: Lesson = $state(structuredClone(data.lesson));

    let uploadVideoFile: File | null | undefined = $state();
    let uploadBannerFile: File | null | undefined = $state();

    async function save() {
        let changedSchedule = !equal(data.lesson.schedule, lesson.schedule);
        if (
            changedSchedule &&
            !confirm(
                "Дата или место проведения изменено, пользователям будет отправлено уведомление. Вы уверены?"
            )
        ) {
            return;
        }

        const fileClient = new UploadClient({ fetch });

        if (uploadBannerFile !== undefined) {
            if (uploadBannerFile === null) {
                lesson.banner = null;
            } else {
                lesson.banner = await fileClient.uploadLessonFile(
                    data.course.id,
                    data.lesson.id,
                    "cover",
                    uploadBannerFile
                );
            }
        }

        if (uploadVideoFile !== undefined) {
            if (uploadVideoFile === null) {
                lesson.video = null;
            } else {
                lesson.video = await fileClient.uploadLessonFile(
                    data.course.id,
                    data.lesson.id,
                    "video",
                    uploadVideoFile
                );
            }
        }

        const result = await api({ fetch })
            .courses({ course: data.course.id })
            .lessons({ lesson: data.lesson.id })
            .patch({
                title: lesson.title,
                description: lesson.description,
                banner: lesson.banner,
                video: lesson.video,
                content: lesson.content,
                homeworkIds: lesson.homeworkIds,
                schedule: changedSchedule ? lesson.schedule : undefined
            });
        if (result.error) {
            toaster.add("Не удалось сохранить урок", "error");
            return;
        }

        await invalidateAll();
        await goto(`${coursePath(data.course)}/lessons/${data.lesson.id}`);
    }
</script>

<div
    class={[
        "flex flex-col h-full py-10 gap-7",
        "max-w-[1000px] mx-10 @min-[1200px]/main:mx-40"
    ]}
>
    <InfoSection
        position={lesson.position}
        bind:title={lesson.title}
        bind:description={lesson.description}
        schedule={lesson.schedule}
        banner={lesson.banner}
        onBannerChange={file => {
            uploadBannerFile = file;
        }}
    />
    <ScheduleSection bind:schedule={lesson.schedule} />
    <VideoSection
        course={data.course}
        video={lesson.video}
        onUploaded={file => (uploadVideoFile = file)}
        onDeleted={() => {
            lesson.video = null;
            uploadVideoFile = null;
        }}
    />
    <ContentSection bind:content={lesson.content} />
    <HomeworksSection
        course={data.course}
        bind:homeworkIds={lesson.homeworkIds}
    />
    <footer class="flex justify-end gap-2.5">
        <a
            class="btn secondary shadow"
            href="{coursePath(data.course)}/lessons/{data.lesson.id}">Отмена</a
        >
        <AsyncButton class="btn shadow" onclick={save}>
            Сохранить
            {#snippet loading()}
                Сохраняем...
            {/snippet}
        </AsyncButton>
    </footer>
</div>
