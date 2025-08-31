<script lang="ts">
    import { goto, invalidate } from "$app/navigation";
    import api from "$lib/api";
    import { coursePath } from "$lib/path";
    import type { Homework } from "$lib/types";
    import EditHomework from "./EditHomework.svelte";

    let { data } = $props();

    let homework: Homework = $state(structuredClone(data.homework));

    async function save() {
        const update = {
            title: homework.title,
            content: homework.content,
            deadline: homework.deadline,
            deadlineOverride: homework.deadlineOverride
        };

        const result = await api({ fetch })
            .courses({ course: data.course.id })
            .homeworks({ homework: data.homework.id })
            .put(update);

        if (result.status === 200) {
            await Promise.allSettled([
                invalidate("app:homework"),
                invalidate("app:calendar")
            ]);
            await goto(
                `${coursePath(data.course)}/homeworks/${data.homework.id}`
            );
        } else {
            alert(result.status);
        }
    }

    async function cancel() {
        await goto(`${coursePath(data.course)}/homeworks/${homework.id}`);
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
