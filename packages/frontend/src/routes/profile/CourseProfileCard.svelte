<script lang="ts">
    import { invalidate } from "$app/navigation";
    import api from "$lib/api";
    import { dismissable } from "$lib/attachments/dismissable.svelte";
    import { coursePath, filePath } from "$lib/path";
    import type { CoursePartial } from "$lib/types";
    import { User } from "itam-edu-common";

    let { user, course }: Props = $props();
    type Props = {
        user: User;
        course: CoursePartial;
    };

    let showContextMenu = $state(false);

    const toggleNotifications = async () => {
        // TODO
        alert("Sorry, not implemented yet!");
    };

    const leaveCourse = async () => {
        if (!confirm(`Вы уверены, что хотите покинуть курс ${course.title}?`)) {
            return;
        }

        const response = await api({ fetch })
            .courses({ course: course.id })
            .students({ student: user.id })
            .delete();
        if (response.error) {
            alert(response.status);
            return;
        }
        await Promise.all([invalidate("app:courses"), invalidate("app:user")]);
        alert(`Вы покинули курс ${course.title}`);
    };
</script>

<li class="flex gap-4">
    <a
        class="contents"
        href={coursePath(course)}
        data-sveltekit-preload-data="off"
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
            <h4 class="flex gap-2 text-on-surface-contrast">
                {course.title}
                {#if user.isCourseStaff(course.id)}
                    <div
                        class={[
                            "px-3 py-1",
                            "bg-on-primary text-primary text-sm-regular",
                            "rounded-xs"
                        ]}
                    >
                        {#if course.ownerId === user.id}
                            Владелец
                        {:else if course.role === "admin"}
                            Администратор
                        {:else}
                            Преподаватель
                        {/if}
                    </div>
                {/if}
            </h4>
            <span class="text-md-regular text-on-surface-muted mb-1">
                {#if course.semester === "autumn"}
                    Осень
                {:else if course.semester === "spring"}
                    Весна
                {/if}
                {course.year}
            </span>
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
    <div class="group relative size-12">
        <button
            class={[
                "size-12 flex justify-center items-center",
                "bg-surface hover:bg-surface-tint rounded-xs"
            ]}
            aria-label="Меню"
            onclick={() => (showContextMenu = true)}
        >
            <i class="ph ph-dots-three-outline-vertical text-[20px]"></i>
        </button>
        {#if showContextMenu}
            <menu
                {@attach dismissable(() => (showContextMenu = false))}
                class={["context-menu absolute top-12 right-0 z-10"]}
            >
                <a class="context-menu-item" href={coursePath(course)}>
                    <i class="ph ph-arrow-right"></i>
                    Открыть курс
                </a>
                <button
                    class="context-menu-item"
                    onclick={async () => {
                        await toggleNotifications();
                        showContextMenu = false;
                    }}
                >
                    <i class="ph ph-bell-slash"></i>
                    Отключить уведомления
                </button>
                {#if course.ownerId !== user.id}
                    <button
                        class="context-menu-item"
                        onclick={async () => {
                            await leaveCourse();
                            showContextMenu = false;
                        }}
                    >
                        <i class="ph ph-sign-out"></i>
                        Покинуть курс
                    </button>
                {/if}
            </menu>
        {/if}
    </div>
</li>
