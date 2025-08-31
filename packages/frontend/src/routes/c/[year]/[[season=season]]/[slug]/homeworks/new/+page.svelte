<script lang="ts">
    import { goto, invalidate } from "$app/navigation";
    import api from "$lib/api";
    import { coursePath } from "$lib/path";
    import type { CreateHomework } from "$lib/types";
    import EditHomework from "../[homeworkId]/edit/EditHomework.svelte";

    let { data } = $props();

    let homework: CreateHomework = $state({
        title: "",
        lessons: [],
        deadline: null,
        deadlineOverride: null,
        content: null
    });

    async function save() {
        const create = {
            title: homework.title,
            content: homework.content,
            deadline: homework.deadline,
            deadlineOverride: homework.deadlineOverride
        };

        const result = await api({ fetch })
            .courses({ course: data.course.id })
            .homeworks.post(create);

        if (result.status === 200) {
            await Promise.allSettled([
                invalidate("app:homeworks"),
                invalidate("app:calendar")
            ]);
            await goto(
                `${coursePath(data.course)}/homeworks/${result.data?.id}`
            );
        } else {
            alert(result.status);
        }
    }
    async function cancel() {
        await goto(`${coursePath(data.course)}/homeworks`);
    }
</script>

<div
    class={[
        "flex flex-col h-full py-10 gap-7",
        "max-w-[1000px] mx-10 @min-[1200px]/main:mx-40"
    ]}
>
    <EditHomework bind:homework onsave={save} oncancel={cancel} />
</div>
