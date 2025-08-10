<script lang="ts">
    import { goto, invalidate } from "$app/navigation";
    import { coursePath } from "$lib/path.js";
    import HomeworksSection from "./HomeworksSection.svelte";
    import ContentSection from "./ContentSection.svelte";
    import InfoSection from "./InfoSection.svelte";
    import type { LessonDTO } from "itam-edu-api/src/courses/lesson/query";
    import api from "$lib/api";
    import ScheduleSection from "./ScheduleSection.svelte";
    import equal from "fast-deep-equal";
    import VideoSection from "./VideoSection.svelte";

    let { data } = $props();

    let lesson: LessonDTO = $state(structuredClone(data.lesson));
    let modifiedHomeworks: string[] = $state(
        data.lesson.homeworks.map(h => h.id)
    );
    let uploadVideoFile: File | null = $state(null);

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

        let video: string | null = lesson.video;
        if (uploadVideoFile !== null) {
            const response = await api({ fetch })
                .files.courses({ course: data.course.id })
                .post({ file: uploadVideoFile });
            if (response.error) {
                alert(response.status);
                return null;
            }
            video = response.data.filename;
        }

        const update = {
            info: {
                title: lesson.title,
                description: lesson.description,
                banner: lesson.banner,
                video
            },
            content: lesson.content,
            homeworks: modifiedHomeworks,
            schedule: changedSchedule ? lesson.schedule : undefined
        };

        const result = await api({ fetch })
            .courses({ course: data.course.id })
            .lessons({ lesson: data.lesson.id })
            .patch(update);

        if (result.status === 200) {
            await Promise.allSettled([
                invalidate("app:lesson"),
                invalidate("app:calendar")
            ]);
            await goto(`${coursePath(data.course)}/lessons/${data.lesson.id}`);
        } else {
            alert(result.status);
        }
    }
</script>

<svelte:head>
    <title>Редактирование урока | {data.course.title}</title>
</svelte:head>

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
        homeworks={lesson.homeworks}
        bind:modifiedHomeworks
    />
    <footer class="flex gap-4">
        <a
            class="btn secondary w-max"
            href="{coursePath(data.course)}/lessons/{data.lesson.id}">Отмена</a
        >
        <button class="btn w-max" onclick={save}>Сохранить</button>
    </footer>
</div>
