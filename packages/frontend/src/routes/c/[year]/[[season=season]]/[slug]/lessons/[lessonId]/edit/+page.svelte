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

    let { data } = $props();

    let lesson: LessonDTO = $state(structuredClone(data.lesson));
    let modifiedHomeworks: string[] = $state(
        data.lesson.homeworks.map(h => h.id)
    );

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

        const update = {
            info: {
                title: lesson.title,
                description: lesson.description,
                banner: lesson.banner
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
            await invalidate("app:lesson");
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
    <InfoSection bind:lesson />
    <ScheduleSection bind:schedule={lesson.schedule} />
    <ContentSection bind:content={lesson.content} />
    <HomeworksSection
        course={data.course}
        homeworks={lesson.homeworks}
        bind:modifiedHomeworks
    />
    <footer class="flex gap-4">
        <a
            class="btn w-max bg-on-primary text-primary"
            href="{coursePath(data.course)}/lessons/{data.lesson.id}">Отмена</a
        >
        <button class="btn w-max" onclick={save}>Сохранить</button>
    </footer>
</div>
