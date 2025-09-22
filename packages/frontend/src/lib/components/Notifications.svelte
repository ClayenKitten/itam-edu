<script lang="ts">
    import type { CoursePartial, Notification } from "$lib/types";
    import { formatDistanceToNowStrict } from "date-fns";
    import { ru } from "date-fns/locale";
    import { onMount } from "svelte";
    import api from "$lib/api";
    import Loader from "./Loader.svelte";
    import { error } from "@sveltejs/kit";

    const { courses }: Props = $props();
    type Props = {
        courses: CoursePartial[];
    };

    let notifications = $state(Promise.resolve<Notification[]>([]));

    onMount(() => {
        notifications = api({ fetch })
            .users.me.notifications.get()
            .then(resp => {
                if (resp.error) {
                    error(resp.status);
                }
                return resp.data.notifications;
            });
    });
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
        {#await notifications}
            <div class="mt-4 mb-2">
                <Loader size="small" />
            </div>
        {:then notifications}
            {#each notifications.toReversed() as notification}
                <li
                    class={[
                        "group/notification flex gap-3 p-3",
                        "bg-surface hover:bg-surface-tint rounded-xs",
                        "transition-colors duration-100"
                    ]}
                >
                    {#if notification.url}
                        <a class="contents" href={notification.url}>
                            {@render notificationEntry(notification)}
                        </a>
                    {:else}
                        {@render notificationEntry(notification)}
                    {/if}
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
        {:catch error}
            <p class="text-md-regular text-on-surface px-3">
                Не удалось загрузить уведомления 🫨
            </p>
        {/await}
    </ul>
</section>

{#snippet notificationEntry(notification: Notification)}
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
    <div class="flex-1 flex flex-col justify-between pb-1">
        <div class="flex justify-between items-center">
            <span class="text-md-medium text-on-surface whitespace-nowrap">
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
                {formatDistanceToNowStrict(new Date(notification.timestamp), {
                    locale: ru,
                    roundingMethod: "floor",
                    addSuffix: true
                })}
            </span>
        </div>
        <div class="text-sm-regular wrap-anywhere">{notification.title}</div>
    </div>
{/snippet}
