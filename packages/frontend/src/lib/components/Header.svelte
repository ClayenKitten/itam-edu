<script lang="ts">
    import CalendarWindow from "$lib/windows/CalendarWindow.svelte";
    import CreateCallWindow from "$lib/windows/CreateCallWindow.svelte";
    import LoginWindow from "$lib/windows/LoginWindow.svelte";
    import { userFilePath, type User } from "itam-edu-common";

    let { user, standalone = false }: Props = $props();

    let createCallWindow: CreateCallWindow;
    let calendarWindow: CalendarWindow;
    let loginWindow: LoginWindow;

    type Props = {
        user: User | null;
        standalone?: boolean;
    };
</script>

<CreateCallWindow bind:this={createCallWindow} />
<CalendarWindow bind:this={calendarWindow} />
<LoginWindow bind:this={loginWindow} />

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
    {#if user}
        <a
            class={[
                "flex justify-center items-center h-full aspect-square hover:bg-on-primary rounded-xs",
                "transition-colors duration-100"
            ]}
            aria-label="Домой"
            href="/home"
        >
            <i class="ph ph-house text-primary text-[20px]"></i>
        </a>
        <button
            class={[
                "flex justify-center items-center h-full aspect-square rounded-xs",
                "hover:bg-on-primary transition-colors duration-100"
            ]}
            aria-label="Начать звонок"
            title="Начать звонок"
            onclick={() => createCallWindow.show()}
        >
            <i class="ph ph-phone-plus text-primary text-[20px]"></i>
        </button>
        <button
            class={[
                "flex justify-center items-center h-full aspect-square rounded-xs",
                "hover:bg-on-primary transition-colors duration-100"
            ]}
            aria-label="Уведомления"
            title="Уведомления"
        >
            <i class="ph ph-bell text-primary text-[20px]"></i>
        </button>
        <button
            class={[
                "flex justify-center items-center h-full aspect-square rounded-xs",
                "hover:bg-on-primary transition-colors duration-100"
            ]}
            aria-label="Календарь"
            title="Календарь"
            onclick={() => calendarWindow.show()}
        >
            <i class="ph ph-calendar-dots text-primary text-[20px]"></i>
        </button>
        <a
            href="/profile"
            class="flex justify-center items-center h-full aspect-square ml-2.5 bg-primary rounded-xs overflow-hidden"
            aria-label="Профиль"
            title="Профиль"
        >
            {#if user.info.avatar}
                <img
                    src={userFilePath(user.id).avatar(user.info.avatar)}
                    alt=""
                />
            {:else}
                <span class="text-on-primary text-comment">
                    {user.displayName[0]}
                </span>
            {/if}
        </a>
    {:else}
        <button class="btn h-full ml-2.5" onclick={() => loginWindow.show()}>
            Войти
        </button>
    {/if}
</header>
