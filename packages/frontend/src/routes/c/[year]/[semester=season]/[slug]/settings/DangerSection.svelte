<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import type { Course } from "$lib/types";
    import type { User } from "itam-edu-common";

    let { course = $bindable() }: Props = $props();

    type Props = {
        user: User;
        course: Course;
    };

    const save = async (changes: Partial<Pick<Course, "isEnrollmentOpen">>) => {
        const result = await api({ fetch })
            .courses({ course: course.id })
            .patch(changes);
        if (result.status !== 200) {
            alert(result.status);
            return;
        }
        await invalidate("app:course");
    };
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <header>
        <h3>Опасная зона</h3>
    </header>
    <div class="flex gap-4 w-max">
        {@render veryScaryToggle({
            enabled: course.isEnrollmentOpen,
            text: e =>
                e ? "Закрыть приём студентов" : "Открыть приём студентов",
            description: e =>
                e
                    ? "Новые студенты не смогут поступить на курс"
                    : "Новые студенты смогут поступать на курс",
            onclick: () => save({ isEnrollmentOpen: !course.isEnrollmentOpen }),
            disabled: course.permissions.course.toggleEnrollment !== true
        })}
    </div>
</section>

{#snippet veryScaryToggle(val: {
    enabled: boolean;
    text: (enabled: boolean) => string;
    description: (enabled: boolean) => string;
    onclick: () => void;
    disabled: boolean;
})}
    <button
        class="btn secondary"
        disabled={val.disabled}
        title={val.description(val.enabled)}
        onclick={() => {
            if (!confirm(val.description(val.enabled) + ".\n\nВы уверены?"))
                return;
            val.onclick();
        }}
    >
        {val.text(val.enabled)}
    </button>
{/snippet}
