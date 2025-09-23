<script lang="ts">
    import { goto, invalidate } from "$app/navigation";
    import { coursePath } from "$lib/path.js";
    import HomeworksSection from "../[lessonId]/edit/HomeworksSection.svelte";
    import ContentSection from "../[lessonId]/edit/ContentSection.svelte";
    import InfoSection from "../[lessonId]/edit/InfoSection.svelte";
    import type { CreateLesson } from "$lib/types";
    import api from "$lib/api";
    import ScheduleSection from "../[lessonId]/edit/ScheduleSection.svelte";
    import VideoSection from "../[lessonId]/edit/VideoSection.svelte";
    import { doOnce } from "$lib/utils/doOnce";
    import { getToaster } from "$lib/Toaster.svelte";

    let { data } = $props();
    const toaster = getToaster();

    let lesson: CreateLesson = $state({
        courseId: data.course.id,
        title: "",
        description: null,
        banner: null,
        video: null,
        content: null,
        homeworkIds: [],
        schedule: null
    });
    let modifiedHomeworks: string[] = $state([]);
    let uploadVideoFile: File | null = $state(null);

    async function create() {
        if (lesson.title.length < 3) {
            toaster.add("Слишком короткое название урока", "error");
            return;
        }

        let video: string | null = null;
        if (uploadVideoFile !== null) {
            const response = await api({ fetch })
                .files.courses({ course: data.course.id })
                .post({ file: uploadVideoFile });
            if (response.error) {
                toaster.add("Не удалось сохранить видео", "error");
                return null;
            }
            video = response.data.filename;
        }

        const val = {
            info: {
                title: lesson.title,
                description: lesson.description,
                banner: lesson.banner,
                video
            },
            content: lesson.content,
            homeworks: modifiedHomeworks,
            schedule: lesson.schedule
        };

        const result = await api({ fetch })
            .courses({ course: data.course.id })
            .lessons.post({ lesson: val });
        if (result.error) {
            toaster.add("Не удалось опубликовать урок", "error");
            return;
        }

        await Promise.allSettled([
            invalidate("app:lessons"),
            invalidate("app:calendar")
        ]);
        await goto(`${coursePath(data.course)}/lessons/${result.data.id}`);
    }
</script>

<div
    class={[
        "flex flex-col h-full py-10 gap-7",
        "max-w-[1000px] mx-10 @min-[1200px]/main:mx-40"
    ]}
>
    <InfoSection course={data.course} bind:lesson />
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
        homeworkIds={lesson.homeworkIds}
        onUpdate={hwIds => {
            modifiedHomeworks = hwIds;
        }}
    />
    <footer class="flex gap-4">
        <a class="btn secondary w-max" href="{coursePath(data.course)}/lessons">
            Отмена
        </a>
        <button class="btn w-max" onclick={doOnce("create-lesson", create)}>
            Опубликовать
        </button>
    </footer>
</div>
