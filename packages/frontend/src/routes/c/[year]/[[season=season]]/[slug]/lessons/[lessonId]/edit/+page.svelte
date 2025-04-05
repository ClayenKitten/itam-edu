<script lang="ts">
    import { goto } from "$app/navigation";
    import { coursePath } from "$lib/path.js";
    import { onMount } from "svelte";
    import HomeworksSection from "./HomeworksSection.svelte";
    import ContentSection from "./ContentSection.svelte";
    import InfoSection from "./InfoSection.svelte";

    let { data } = $props();

    const canEdit =
        data.permissions?.course.find(x => x.courseId === data.course.id)
            ?.permissions.canEditContent === true;
    onMount(() => {});

    async function save() {
        // TODO
    }

    async function leave() {
        await goto(`${coursePath(data.course)}/lessons/${data.lesson.id}`);
    }
</script>

<div
    class={[
        "flex flex-col h-full py-10 gap-7",
        "max-w-[1000px] mx-10 @min-[1200px]/main:mx-40"
    ]}
>
    <InfoSection lesson={data.lesson} />
    <ContentSection lesson={data.lesson} />
    <HomeworksSection course={data.course} lesson={data.lesson} />
    <footer class="flex gap-4">
        <a
            class="btn w-max bg-on-primary text-primary"
            href="{coursePath(data.course)}/lessons">Отмена</a
        >
        <button class="btn w-max" onclick={save}>Сохранить</button>
    </footer>
</div>
