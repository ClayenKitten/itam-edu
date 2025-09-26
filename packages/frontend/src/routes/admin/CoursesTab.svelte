<script lang="ts">
    import api from "$lib/api";
    import { goto, invalidate } from "$app/navigation";
    import { coursePath, filePath } from "$lib/path";
    import { getPrompter } from "$lib/Prompter.svelte";
    import type { CoursePartial, CreateCourse } from "$lib/types";
    import { doOnce } from "$lib/utils/doOnce";
    import NewCoursePrompt from "./NewCoursePrompt.svelte";
    import { getToaster } from "$lib/Toaster.svelte";
    import { formatPeriod } from "$lib/format";
    import type { UserDto } from "itam-edu-api/src/users/query";

    const { users, courses }: Props = $props();
    type Props = {
        users: Promise<UserDto[]>;
        courses: CoursePartial[];
    };
    const prompter = getPrompter();
    const toaster = getToaster();

    const periods = $derived(
        Array.from(new Set(courses.map(c => formatPeriod(c))).values())
    );
    let period: string = $state(
        formatPeriod({
            year: new Date().getFullYear(),
            semester:
                new Date().getMonth() <= 4 || new Date().getMonth() === 11
                    ? "spring"
                    : "autumn"
        })
    );

    async function createCourse(data: CreateCourse) {
        const result = await api({ fetch }).courses.post(data);
        if (result.error) {
            if (result.status === 409) {
                toaster.add(
                    "Курс с таким идентификатором и периодом уже существует",
                    "error"
                );
            } else {
                toaster.add("Не удалось создать курс", "error");
            }
            return;
        }
        await Promise.all([invalidate("app:courses"), invalidate("app:user")]);
        await goto(coursePath(result.data));
    }
</script>

<section class="flex flex-col gap-5">
    <article class="flex flex-col gap-5 p-6 rounded-lg shadow">
        {#if periods.length > 0}
            <h4>
                <select bind:value={period}>
                    {#each periods as option (option)}
                        <option class="text-lg-medium">{option}</option>
                    {/each}
                </select>
            </h4>
            <hr class="border-surface-border" />
        {/if}
        <ul class="flex flex-col gap-4">
            {#each courses.filter(c => formatPeriod(c) === period) as course (course.id)}
                <li class="flex">
                    <a
                        class="flex-1 flex items-start gap-4"
                        href={coursePath(course)}
                    >
                        <div
                            class={[
                                "size-[86px] shrink-0 flex justify-center items-center",
                                "bg-cover bg-center bg-primary rounded-md "
                            ]}
                            style:background-image={course.cover
                                ? `url(${filePath(course.cover)})`
                                : null}
                        >
                            {#if !course.cover}
                                <span class="text-on-primary text-sm-regular">
                                    {course.title.slice(0, 8)}
                                </span>
                            {/if}
                        </div>
                        <div class="flex-1 flex flex-col">
                            <h4
                                class="flex items-start gap-2 text-on-surface-contrast"
                            >
                                {course.title}
                                {#if course.isArchived}
                                    <div
                                        class={[
                                            "px-3 py-1",
                                            "bg-on-primary text-primary text-sm-regular",
                                            "rounded-xs"
                                        ]}
                                    >
                                        Архивирован
                                    </div>
                                {/if}
                                {#if !course.isPublished}
                                    <div
                                        class={[
                                            "px-3 py-1",
                                            "bg-on-primary text-primary text-sm-regular",
                                            "rounded-xs"
                                        ]}
                                    >
                                        Неопубликован
                                    </div>
                                {/if}
                            </h4>
                            <p
                                class="text-on-surface text-md-regular line-clamp-2 text-ellipsis"
                            >
                                {#if course.description}
                                    {course.description}
                                {:else}
                                    <span class="text-on-surface-muted italic">
                                        Здесь должно быть описание курса...
                                    </span>
                                {/if}
                            </p>
                        </div>
                    </a>
                    <div class="shrink-0 group relative size-12">
                        <button
                            class={[
                                "size-12 flex justify-center items-center",
                                "bg-surface hover:bg-surface-tint rounded-xs"
                            ]}
                            aria-label="Меню"
                            onclick={() => {}}
                        >
                            <i
                                class="ph ph-dots-three-outline-vertical text-[20px]"
                            ></i>
                        </button>
                        <menu
                            class="not-group-focus-within:hidden context-menu absolute top-12 right-0 z-10"
                        >
                            {@render contextMenuBtns(course)}
                        </menu>
                    </div>
                </li>
            {:else}
                <div class="col-span-full mx-auto p-12 text-xl-medium">
                    Пусто! 🧐
                </div>
            {/each}
        </ul>
    </article>
    <menu class="flex">
        <button
            class="btn h-11"
            onclick={doOnce("createCourse", async () => {
                const newCourse = await prompter.show(NewCoursePrompt, {
                    users: await users
                });
                if (!newCourse) return;
                await createCourse(newCourse);
            })}
        >
            <i class="ph ph-plus text-on-primary text-[20px]"></i>
            Создать новый курс
        </button>
    </menu>
</section>

{#snippet contextMenuBtns(course: CoursePartial)}
    <button
        class="context-menu-item"
        onclick={async () => {
            const confirmed = confirm(
                course.isArchived
                    ? "Преподаватели вновь смогут редактировать курс, а студенты — сдавать работы.\n\nВы уверены?"
                    : "Курс будет доступен только для чтения, а приём работ — закрыт.\n\nВы уверены?"
            );
            if (!confirmed) return;
            const result = await api({ fetch })
                .courses({ course: course.id })
                .patch({
                    isArchived: !course.isArchived
                });
            if (result.status !== 200) {
                toaster.add("Не удалось сохранить изменения", "error");
                return;
            }
            await invalidate("app:courses");
        }}
    >
        {#if !course.isArchived}
            <i class="ph ph-archive"></i>
            Архивировать
        {:else}
            <i class="ph ph-archive"></i>
            Разархивировать
        {/if}
    </button>
    <button
        class="context-menu-item"
        onclick={async () => {
            const confirmed = confirm(
                course.isPublished
                    ? "Курс станет доступен только преподавателям.\n\nВы уверены?"
                    : "Курс станет доступен всем посетителям платформы.\n\nВы уверены?"
            );
            if (!confirmed) return;
            const result = await api({ fetch })
                .courses({ course: course.id })
                .patch({
                    isPublished: !course.isPublished
                });
            if (result.status !== 200) {
                toaster.add("Не удалось сохранить изменения", "error");
                return;
            }
            await invalidate("app:courses");
        }}
    >
        {#if !course.isPublished}
            <i class="ph ph-globe"></i>
            Опубликовать
        {:else}
            <i class="ph ph-globe-x"></i>
            Снять с публикации
        {/if}
    </button>
    <button
        class="context-menu-item"
        onclick={e => {
            alert("Sorry, not implemented yet!");
        }}
    >
        <i class="ph ph-trash"></i>
        Удалить
    </button>
{/snippet}
