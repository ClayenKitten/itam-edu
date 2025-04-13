<script lang="ts">
    import type { Course } from "$lib/types";

    let { readonly, course = $bindable() }: Props = $props();

    type Props = {
        readonly: boolean;
        course: Course;
    };
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <header>
        <h3>Опасная зона</h3>
    </header>
    <div class="flex gap-4 w-max">
        {@render veryScaryToggle({
            enabled: course.isPublished,
            text: e => (e ? "Снять курс с публикации" : "Опубликовать курс"),
            description: e =>
                e
                    ? "Курс будет доступен только сотрудникам"
                    : "Курс станет публично доступен",
            onclick: () => {
                course.isPublished = !course.isPublished;
                // TODO: allow (un)publishing course
                alert("Not implemented");
            }
        })}
        {@render veryScaryToggle({
            enabled: course.isArchived,
            text: e => (e ? "Разархивировать курс" : "Архивировать курс"),
            description: e =>
                e
                    ? "Курс снова станет редактируемым, а студенты смогут сдавать работы"
                    : "Курс будет доступен только для чтения, а приём работ закрыт",
            onclick: () => {
                course.isArchived = !course.isArchived;
                // TODO: allow course archiving
                alert("Not implemented");
            }
        })}
        {@render veryScaryToggle({
            enabled: course.isEnrollmentOpen,
            text: e =>
                e ? "Закрыть приём студентов" : "Открыть приём студентов",
            description: e =>
                e
                    ? "Новые студенты не смогут поступить на курс"
                    : "Новые студенты смогут поступать на курс",
            onclick: () => {
                course.isEnrollmentOpen = !course.isEnrollmentOpen;
                // TODO: allow course enrollment closure
                alert("Not implemented");
            }
        })}
    </div>
</section>

{#snippet veryScaryToggle(val: {
    enabled: boolean;
    text: (enabled: boolean) => string;
    description: (enabled: boolean) => string;
    onclick: () => void;
})}
    <button
        class="btn secondary"
        disabled={readonly}
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
