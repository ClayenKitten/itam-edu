<script lang="ts">
    import LoginWindow from "$lib/windows/LoginWindow.svelte";
    import type { User } from "itam-edu-common";
    import type { CoursePartial } from "$lib/types";
    import { dismissable } from "$lib/attachments/dismissable.svelte";
    import Notifications from "./Notifications.svelte";
    import { filePath } from "$lib/path";
    import IconButton from "./IconButton.svelte";

    let { user, courses, standalone = false, onShowMenu }: Props = $props();

    let loginWindow: LoginWindow;

    let showNotifications = $state(false);

    type Props = {
        user: User | null;
        courses: CoursePartial[];
        standalone?: boolean;
        onShowMenu?: () => void;
    };
</script>

<LoginWindow bind:this={loginWindow} />

<header
    class={[
        "z-1 sticky top-0 flex justify-between md:justify-end items-center h-14 px-7 py-2 gap-2.5",
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
    {#if onShowMenu}
        <div class="md:hidden">
            <IconButton
                icon="ph-list"
                title="Показать навигацию"
                onclick={() => onShowMenu()}
            />
        </div>
    {/if}
    <div class={["flex justify-end items-center h-14 px-7 py-2 gap-2.5"]}>
        <a
            class={[
                "flex justify-center items-center h-full aspect-square",
                "hover:bg-on-primary rounded-xs transition-colors duration-100"
            ]}
            aria-label="Домашняя страница"
            title="Домашняя страница"
            href="/"
        >
            <i class="ph ph-house text-primary text-[20px]"></i>
        </a>
        {#if user && (user.info.role === "admin" || user.info.role === "supervisor")}
            <a
                class={[
                    "flex justify-center items-center h-full aspect-square",
                    "hover:bg-on-primary rounded-xs transition-colors duration-100"
                ]}
                aria-label="Административная панель"
                title="Административная панель"
                href="/admin"
            >
                <i class="ph ph-star text-primary text-[20px]"></i>
            </a>
        {/if}
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
                <button
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
                    onclick={() => (showNotifications = true)}
                >
                    <i class="ph ph-bell text-primary text-[20px]"></i>
                </button>
                {#if showNotifications}
                    <div
                        class="absolute top-full right-0"
                        {@attach dismissable(() => (showNotifications = false))}
                    >
                        <Notifications {courses} />
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
                    ? `url(${filePath(user.info.avatar)})`
                    : null}
                aria-label="Профиль"
                title="Профиль"
            >
                {user.telegram.username[0]}
            </a>
        {:else}
            <button
                class="btn h-full ml-2.5"
                onclick={() => loginWindow.show()}
            >
                Войти
            </button>
        {/if}
    </div>
</header>
