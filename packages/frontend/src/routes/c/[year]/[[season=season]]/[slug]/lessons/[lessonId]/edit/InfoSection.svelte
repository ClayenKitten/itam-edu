<script lang="ts">
    import { formatLessonSchedule } from "$lib/format";
    import type { CreateLesson, Lesson } from "$lib/types";
    import { courseFilePath } from "itam-edu-common";

    let { lesson = $bindable() }: Props = $props();

    type Props = {
        lesson: Lesson | CreateLesson;
    };
</script>

<section class="flex flex-col gap-6 p-7.5 rounded-xl bg-surface shadow">
    <header class="flex flex-col gap-2">
        {#if "position" in lesson}
            <h2>Урок {lesson.position + 1}</h2>
        {:else}
            <h2>Новый урок</h2>
        {/if}
        {#if lesson.schedule}
            <p class="text-date text-on-surface-muted">
                {formatLessonSchedule(lesson.schedule)}
            </p>
        {/if}
    </header>
    <label class="flex flex-col gap-2">
        <h4>Название</h4>
        <input class="input" bind:value={lesson.title} />
    </label>
    <div class=" flex gap-6">
        <label class="flex-1 flex flex-col gap-2">
            <h4>Описание</h4>
            <textarea
                class="input h-[200px] resize-none"
                maxlength="1000"
                bind:value={lesson.description}
            ></textarea>
        </label>
        <label class="shrink-0 flex flex-col gap-2">
            <h4>Обложка</h4>
            <div
                class="border-2 border-on-primary rounded-sm overflow-hidden focus-within:border-primary"
            >
                <div
                    class="group relative flex justify-center items-center h-[200px] aspect-[318/200] cursor-pointer"
                >
                    <input class="h-0 w-0 outline-0" type="file" />
                    {#if lesson.banner}
                        <img
                            class="object-contain"
                            src={courseFilePath(lesson.courseId).public(
                                lesson.banner
                            )}
                            alt=""
                        />
                        <button
                            class={[
                                "absolute top-4 right-4 flex items-center justify-center h-[46px] w-[46px]",
                                "rounded-full bg-primary text-on-primary hover:bg-on-primary hover:text-primary",
                                "transition-colors duration-100"
                            ]}
                            onclick={() => (lesson.banner = null)}
                            aria-label="Удалить"
                        >
                            <i class="ph ph-trash text-[20px]"></i>
                        </button>
                    {:else}
                        <div
                            class={[
                                "flex items-center justify-center h-[46px] w-[46px]",
                                "rounded-full bg-primary text-on-primary group-hover:bg-on-primary group-hover:text-primary",
                                "transition-colors duration-100"
                            ]}
                        >
                            <i class="ph ph-upload-simple text-[20px]"></i>
                        </div>
                    {/if}
                </div>
            </div>
        </label>
    </div>
</section>
