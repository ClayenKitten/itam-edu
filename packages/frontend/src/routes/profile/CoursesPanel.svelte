<script lang="ts">
    import type { CoursePartial } from "$lib/types";
    import type { User } from "itam-edu-common";
    import CourseProfileCard from "./CourseProfileCard.svelte";

    let { user, courses }: Props = $props();
    type Props = {
        user: User;
        courses: CoursePartial[];
    };

    let filterKind: "active" | "completed" = $state("active");
    let filter = $derived.by((): ((c: CoursePartial) => boolean) => {
        switch (filterKind) {
            case "active":
                return c => {
                    if (!user.isCourseMember(c.id)) {
                        return false;
                    }
                    return !c.isArchived;
                };
            case "completed":
                return c => {
                    if (!user.isCourseMember(c.id)) {
                        return false;
                    }
                    return c.isArchived;
                };
        }
    });
    let filteredCourses = $derived(courses.filter(filter));
</script>

<section
    class={[
        "flex-1 w-200 min-w-160 flex flex-col gap-7.5 p-6",
        "border border-surface-border bg-surface shadow rounded-lg"
    ]}
>
    <h3>Мои курсы</h3>
    <menu class="flex gap-2">
        {@render fltr("Текущие", "active")}
        {@render fltr("Завершённые", "completed")}
    </menu>
    <ul class="flex flex-col gap-4">
        {#each filteredCourses as course}
            <CourseProfileCard {user} {course} />
        {:else}
            <div class="text-on-surface-muted text-md-medium">Пока пусто!</div>
        {/each}
    </ul>
</section>

{#snippet fltr(text: string, key: typeof filterKind)}
    <button
        class={[
            "h-12 px-5 py-3",
            "text-lg-medium border rounded-xs shadow",
            "transition-colors duration-100",
            filterKind === key
                ? "bg-primary text-on-primary border-primary cursor-default"
                : [
                      "bg-surface text-on-surface border-surface-border",
                      "hover:bg-on-primary hover:text-primary hover:border-primary-border"
                  ]
        ]}
        onclick={() => (filterKind = key)}>{text}</button
    >
{/snippet}
