<script lang="ts">
    import type { CoursePartial, Notification } from "$lib/types";
    import { formatDistanceToNowStrict } from "date-fns";
    import { ru } from "date-fns/locale";

    export const { courses, notifications }: Props = $props();

    type Props = {
        notifications: Notification[];
        courses: CoursePartial[];
    };
</script>

<section
    class={[
        "flex flex-col gap-3 w-100 p-4",
        "bg-surface border border-surface-border rounded-sm"
    ]}
>
    <header class="self-start px-3">
        <h5>Уведомления</h5>
    </header>
    <ul class="flex flex-col max-h-60 overflow-y-auto">
        {#each notifications.toReversed() as notification}
            <li
                class={[
                    "group/notification flex gap-3 p-3",
                    "bg-surface hover:bg-surface-tint rounded-xs",
                    "transition-colors duration-100"
                ]}
            >
                {#if notification.url}
                    <a class="size-full contents" href={notification.url}>
                        {@render notificationChildren()}
                    </a>
                {:else}
                    {@render notificationChildren()}
                {/if}

                {#snippet notificationChildren()}
                    <div
                        class={[
                            "size-12 flex items-center justify-center shrink-0",
                            "text-primary bg-on-primary rounded-xs",
                            "border border-on-primary group-hover/notification:border-primary",
                            "transition-colors duration-100"
                        ]}
                    >
                        <i class={`ph ph-${notification.icon} text-[21px]`}></i>
                    </div>
                    <div class="flex flex-col justify-between pb-1">
                        <div class="flex justify-between items-center">
                            <span
                                class="text-md-medium text-on-surface whitespace-nowrap"
                            >
                                {#if notification.courseId}
                                    {@const course = courses.find(
                                        c => c.id === notification.courseId
                                    )}
                                    {#if course}
                                        {course.title}
                                    {:else}
                                        Удалённый курс
                                    {/if}
                                {:else}
                                    Платформа ITAM
                                {/if}
                            </span>
                            <span class="text-sm-regular text-on-surface-muted">
                                {formatDistanceToNowStrict(
                                    new Date(notification.timestamp),
                                    { locale: ru, roundingMethod: "floor" }
                                )}
                            </span>
                        </div>
                        <div class="text-sm-regular">{notification.title}</div>
                    </div>
                {/snippet}
            </li>
        {:else}
            <div
                class={[
                    "flex items-center justify-center h-30",
                    "text-md-regular text-on-surface-muted"
                ]}
            >
                Уведомлений пока нет
            </div>
        {/each}
    </ul>
</section>
