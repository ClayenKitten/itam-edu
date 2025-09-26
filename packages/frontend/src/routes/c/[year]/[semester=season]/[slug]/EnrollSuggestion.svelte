<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import api from "$lib/api";
    import { getToaster } from "$lib/Toaster.svelte";
    import type { Course } from "$lib/types";
    import type { User } from "itam-edu-common";

    const { user, course, text }: Props = $props();
    type Props = {
        user: User | null;
        course: Course;
        text: string;
    };
    const toaster = getToaster();

    const enroll = async () => {
        if (!user) {
            await goto("?login");
            return;
        }
        const result = await api({ fetch })
            .courses({ course: course.id })
            .students({ student: user.id })
            .put();
        if (result.error) {
            toaster.add("Не удалось поступить на курс", "error");
            return;
        }
        await invalidateAll();
    };
</script>

<div
    class={[
        "sticky bottom-0 mt-auto self-stretch py-2.5 px-6",
        "flex items-center justify-between",
        "bg-on-primary border-t border-primary-border"
    ]}
>
    <h5>{text}</h5>
    <button class="btn" onclick={enroll}>Поступить</button>
</div>
