<script lang="ts">
    import LoginWindow from "$lib/windows/LoginWindow.svelte";
    import { userFilePath, type User } from "itam-edu-common";
    import Notifications from "./Notifications.svelte";
    import type { CoursePartial, Notification } from "$lib/types";

    let { user, notifications, courses, standalone = false }: Props = $props();

    let loginWindow: LoginWindow;

    let showNotifications = $state(false);

    type Props = {
        user: User | null;
        notifications: Notification[];
        courses: CoursePartial[];
        standalone?: boolean;
    };
</script>

<LoginWindow bind:this={loginWindow} />

<svelte:window
    onkeydown={e => {
        if (e.key === "Escape") {
            showNotifications = false;
        }
    }}
/>

<header
    class={[
        "z-1 sticky top-0 flex justify-end items-center h-14 px-7 py-2 gap-2.5",
        "bg-surface border-b border-surface-border"
    ]}
>
    {#if standalone}
        <a class="contents" href="https://itatmisis.ru">
            <img
                class="w-[82px] h-[26px] mr-auto ml-1"
                src="/logo.svg"
                alt=""
            />
        </a>
    {/if}
    <a
        class={[
            "flex justify-center items-center h-full aspect-square",
            "hover:bg-on-primary rounded-xs transition-colors duration-100"
        ]}
        aria-label="Домашняя страница"
        title="Домашняя страница"
        href="/home"
    >
        <i class="ph ph-house text-primary text-[20px]"></i>
    </a>
    <a
        class={[
            "flex justify-center items-center h-full aspect-square",
            "hover:bg-on-primary rounded-xs transition-colors duration-100"
        ]}
        aria-label="Календарь"
        title="Календарь"
        href="/calendar"
    >
        <i class="ph ph-calendar-dots text-primary text-[20px]"></i>
    </a>
    {#if user}
        <div class="relative h-full aspect-square">
            <label
                class={[
                    "peer size-full flex justify-center items-center",
                    showNotifications
                        ? "bg-on-primary"
                        : "bg-surface hover:bg-on-primary",
                    "rounded-xs cursor-pointer",
                    "transition-colors duration-100"
                ]}
                aria-label="Уведомления"
                title="Уведомления"
            >
                <input
                    class="hidden"
                    type="checkbox"
                    bind:checked={showNotifications}
                />
                <i class="ph ph-bell text-primary text-[20px]"></i>
            </label>
            {#if showNotifications}
                <div class="absolute top-full right-0">
                    <Notifications {notifications} {courses} />
                </div>
            {/if}
        </div>
        <a
            href="/profile"
            class={[
                "cover h-full aspect-square ml-2.5",
                "text-on-primary text-md-medium bg-primary rounded-xs overflow-hidden"
            ]}
            style:background-image={user.info.avatar
                ? `url(${userFilePath(user.id).avatar(user.info.avatar)})`
                : null}
            aria-label="Профиль"
            title="Профиль"
        >
            {user.telegram.username[0]}
        </a>
    {:else}
        <button class="btn h-full ml-2.5" onclick={() => loginWindow.show()}>
            Войти
        </button>
    {/if}
</header>
