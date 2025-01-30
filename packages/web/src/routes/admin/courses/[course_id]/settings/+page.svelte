<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api.js";
    import Switch from "$lib/components/Switch.svelte";

    const { data } = $props();

    let course = $state(structuredClone(data.course));
    const saveCourse = async (courseUpdate: Partial<typeof course>) => {
        await api({ fetch }).courses({ course: course.id }).put(courseUpdate);
        await invalidate("app:course");
    };

    const canEdit = $derived(
        data.permissions.course.find(x => x.courseId === data.course.id)
            ?.canEditInfo ?? false
    );
</script>

{#snippet sectionHeader(title: string, icon: string)}
    <header class="flex items-center gap-2.5">
        <i class="ph-fill ph-{icon} text-2xl"></i>
        <h1 class="text-2xl font-bold">{title}</h1>
    </header>
    <hr class="-mx-6 -mt-2 border-surface-light" />
{/snippet}

{#snippet optionHeader(header: string, tooltip?: string)}
    <div class="flex items-center text-lg gap-2">
        <span>{header}</span>
        {#if tooltip}
            <i title={tooltip} class="ph ph-question"></i>
        {/if}
    </div>
{/snippet}

<section class="flex flex-col gap-5 text-text">
    <section class="flex flex-col gap-8 p-6 bg-surface lg:rounded">
        {@render sectionHeader("Course information", "info")}
        <label
            class="flex flex-col lg:flex-row justify-between gap-x-40 gap-y-4 max-w-[600px]"
        >
            {@render optionHeader("Title")}
            <input
                bind:value={course.title}
                class="w-full lg:w-[300px] text-base"
                readonly={!canEdit}
            />
        </label>
        <label
            class="flex flex-col justify-between gap-x-40 gap-y-4 max-w-[600px]"
        >
            {@render optionHeader("Description")}
            <textarea
                bind:value={course.description}
                maxlength="384"
                class="w-full h-[160px] text-base"
                readonly={!canEdit}
            ></textarea>
        </label>
        <label
            class="flex flex-col lg:flex-row justify-between gap-x-40 gap-y-4 max-w-[600px]"
        >
            {@render optionHeader(
                "Path",
                "Machine-readable path. Can't be edited after course creation."
            )}
            <input
                value={[course.year, course.semester, course.slug]
                    .filter(x => x !== null)
                    .join("/")}
                class="w-full lg:w-[300px] text-base"
                readonly
            />
        </label>
        {#if canEdit}
            <button
                onclick={() =>
                    saveCourse({
                        title: course.title,
                        description: course.description
                    })}
                class="w-[100px] text-lg py-2 bg-success hover:opacity-95 rounded-sm"
            >
                Save
            </button>
        {/if}
    </section>
    <section class="flex flex-col gap-8 p-6 bg-surface lg:rounded">
        {@render sectionHeader("Blog", "text-t")}
        <label class="flex justify-between items-center gap-y-4 max-w-[600px]">
            {@render optionHeader("Enabled")}
            <Switch bind:value={course.isBlogEnabled} disabled={!canEdit} />
        </label>
        {#if canEdit}
            <button
                onclick={() =>
                    saveCourse({ isBlogEnabled: course.isBlogEnabled })}
                class="w-[100px] text-lg py-2 bg-success hover:opacity-95 rounded-sm"
            >
                Save
            </button>
        {/if}
    </section>
    <section class="flex flex-col gap-8 p-6 bg-surface lg:rounded">
        {@render sectionHeader("Feedback", "chat-teardrop-dots")}
        <label class="flex justify-between items-center gap-y-4 max-w-[600px]">
            {@render optionHeader("Enabled")}
            <Switch bind:value={course.isFeedbackEnabled} disabled={!canEdit} />
        </label>
        {#if canEdit}
            <button
                onclick={() =>
                    saveCourse({ isFeedbackEnabled: course.isFeedbackEnabled })}
                class="w-[100px] text-lg py-2 bg-success hover:opacity-95 rounded-sm"
            >
                Save
            </button>
        {/if}
    </section>
    <section class="flex flex-col gap-8 p-6 max-lg:pb-10 bg-surface lg:rounded">
        {#snippet dangerButton(
            onclick: () => void,
            danger: boolean,
            text: (e: boolean) => string,
            icon: string
        )}
            <button
                {onclick}
                class={[
                    "flex gap-2 justify-center items-center w-full lg:w-[240px] text-white h-10 text-left px-4 rounded-sm",
                    "disabled:bg-disabled",
                    danger ? "bg-danger" : "bg-success"
                ]}
                disabled={!canEdit}
            >
                <i class="ph ph-{icon} text-xl"></i>
                {text(danger)}
            </button>
        {/snippet}

        {@render sectionHeader("Danger Zone", "warning-octagon")}
        <label
            class="flex flex-col lg:flex-row justify-between gap-4 max-w-[600px]"
        >
            {@render optionHeader(
                course.isPublished ? "Unpublish" : "Publish",
                "Published courses are accessible to students"
            )}
            {@render dangerButton(
                async () => {
                    await saveCourse({ isPublished: !course.isPublished });
                    course.isPublished = !course.isPublished;
                },
                course.isPublished,
                d => (d ? "Unpublish this course" : "Publish this course"),
                "file-dashed"
            )}
        </label>
        <label
            class="flex flex-col lg:flex-row justify-between gap-4 max-w-[600px]"
        >
            {@render optionHeader(
                course.isEnrollmentOpen
                    ? "Close enrollment"
                    : "Open enrollment",
                "Courses with closed enrollment don't accept new students, but already enrolled students are not affected"
            )}
            {@render dangerButton(
                async () => {
                    await saveCourse({
                        isEnrollmentOpen: !course.isEnrollmentOpen
                    });
                    course.isEnrollmentOpen = !course.isEnrollmentOpen;
                },
                course.isEnrollmentOpen,
                d => (d ? "Close enrollment" : "Open enrollment"),
                "student"
            )}
        </label>
        <label
            class="flex flex-col lg:flex-row justify-between gap-4 max-w-[600px]"
        >
            {@render optionHeader(
                course.isArchived ? "Unarchive" : "Archive",
                "Archived courses are still accessible to students if published, but in a read-only mode"
            )}
            {@render dangerButton(
                async () => {
                    await saveCourse({ isArchived: !course.isArchived });
                    course.isArchived = !course.isArchived;
                },
                course.isArchived,
                d => (d ? "Archive this course" : "Unarchive this course"),
                "archive"
            )}
        </label>
    </section>
</section>
