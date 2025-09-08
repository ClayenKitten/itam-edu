<script lang="ts">
    import { goto, invalidate } from "$app/navigation";
    import api from "$lib/api";
    import { coursePath } from "$lib/path";
    import { getToaster } from "$lib/Toaster.svelte";
    import type { CreateHomework } from "$lib/types";
    import EditHomework from "../[homeworkId]/edit/EditHomework.svelte";

    let { data } = $props();
    const toaster = getToaster();

    let newHomework: CreateHomework = $state({
        title: "",
        lessons: [],
        deadline: null,
        deadlineOverride: null,
        content: null
    });

    async function save() {
        const create = {
            title: newHomework.title,
            content: newHomework.content,
            deadline: newHomework.deadline,
            deadlineOverride: newHomework.deadlineOverride
        };

        const result = await api({ fetch })
            .courses({ course: data.course.id })
            .homeworks.post(create);
        if (result.error) {
            toaster.add("Не удалось создать задание", "error");
            return;
        }
        const homework = result.data;

        await Promise.allSettled([
            invalidate("app:homeworks"),
            invalidate("app:calendar")
        ]);
        await goto(`${coursePath(data.course)}/homeworks/${homework.id}`);
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
    <EditHomework bind:homework={newHomework} onsave={save} oncancel={cancel} />
</div>
