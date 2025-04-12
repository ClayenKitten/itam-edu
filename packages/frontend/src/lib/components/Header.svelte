<script lang="ts">
    import { MyWindow } from "$lib/windows";
    import type { User } from "itam-edu-common";

    let { user, standalone = false }: Props = $props();

    type Props = {
        user: User | null;
        standalone?: boolean;
    };
</script>

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
            aria-label="Уведомления"
        >
            <i class="ph ph-bell text-primary text-[20px]"></i>
        </button>
        <button
            class={[
                "flex justify-center items-center h-full aspect-square rounded-xs",
                "hover:bg-on-primary transition-colors duration-100"
            ]}
            aria-label="Календарь"
            onclick={() => new MyWindow("calendar").open()}
        >
            <i class="ph ph-calendar-dots text-primary text-[20px]"></i>
        </button>
        <a
            href="/profile"
            class="flex justify-center items-center h-full aspect-square ml-2.5 bg-primary rounded-xs overflow-hidden"
            aria-label="Профиль"
        >
            {#if user.info.avatar}
                <img src={user.info.avatar} alt="" />
            {:else}
                <span class="text-on-primary text-comment">
                    {user.displayName[0]}
                </span>
            {/if}
        </a>
    {:else}
        <button
            class="btn h-full ml-2.5"
            onclick={() => new MyWindow("login").open()}>Войти</button
        >
    {/if}
</header>
