<script lang="ts">
    import { goto, invalidate } from "$app/navigation";
    import { coursePath } from "$lib/path.js";
    import HomeworksSection from "../[lessonId]/edit/HomeworksSection.svelte";
    import ContentSection from "../[lessonId]/edit/ContentSection.svelte";
    import InfoSection from "../[lessonId]/edit/InfoSection.svelte";
    import type { CreateLesson } from "$lib/types";
    import api from "$lib/api";
    import ScheduleSection from "../[lessonId]/edit/ScheduleSection.svelte";

    let { data } = $props();

    let lesson: CreateLesson = $state({
        courseId: data.course.id,
        title: "",
        description: null,
        banner: null,
        content: null,
        homeworks: [],
        schedule: null
    });
    let modifiedHomeworks: string[] = $state([]);

    async function create() {
        if (lesson.title.length < 3) {
            alert("Слишком короткое название урока");
            return;
        }

        const val = {
            info: {
                title: lesson.title,
                description: lesson.description,
                banner: lesson.banner
            },
            content: lesson.content,
            homeworks: modifiedHomeworks,
            schedule: lesson.schedule
        };

        const result = await api({ fetch })
            .courses({ course: data.course.id })
            .lessons.post({ lesson: val });

        if (!result.error) {
            await invalidate("app:lessons");
            await goto(`${coursePath(data.course)}/lessons/${result.data.id}`);
        } else {
            alert(result.status);
        }
    }
</script>

<svelte:head>
    <title>Новый урок | {data.course.title}</title>
</svelte:head>

<div
    class={[
        "flex flex-col h-full py-10 gap-7",
        "max-w-[1000px] mx-10 @min-[1200px]/main:mx-40"
    ]}
>
    <InfoSection course={data.course} bind:lesson />
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
            href="{coursePath(data.course)}/lessons">Отмена</a
        >
        <button class="btn w-max" onclick={create}>Опубликовать</button>
    </footer>
</div>
