<script lang="ts">
    import { invalidate } from "$app/navigation";
    import { env } from "$env/dynamic/public";
    import api from "$lib/api";
    import { MyWindow } from ".";

    let { code }: { code?: string } = $props();

    const login = async () => {
        if (!code) return;
        const resp = await api({
            fetch,
            toast: resp => ({
                title: resp.ok
                    ? "Авторизация успешна"
                    : "Авторизация не удалась"
            })
        }).users.sessions.post({ code: code.toUpperCase() });

        if (resp.error) {
            return;
        }
        await invalidate("app:user");
        MyWindow.current?.close();
    };
</script>

<div
    class="w-150 flex flex-col px-10 pt-10 pb-12.5 gap-5 text-on-surface bg-surface rounded-xl"
>
    <header class="flex flex-col">
        <button
            class="self-end flex justify-center items-center h-8 w-8 border border-primary rounded-[8px]"
            aria-label="Закрыть"
            onclick={() => MyWindow.current?.close()}
        >
            <i class="ph ph-x text-[12.5px]"></i>
        </button>
        <h2 class="self-start">Вход</h2>
    </header>
    <label class="flex flex-col gap-1.5">
        <span class="text-on-surface-muted text-button">Код</span>
        <input
            class="h-17 text-on-background text-comment px-5 border border-primary rounded-sm"
            bind:value={code}
            placeholder="Код от телеграм-бота"
        />
    </label>
    <button class="btn h-17 text-comment" disabled={!code} onclick={login}>
        Войти
    </button>
    <footer class="text-comment text-center">
        Напишите
        <a
            class="text-primary underline"
            target="_blank"
            href="https://t.me/{env.ITAM_EDU_FRONTEND_TG_USERNAME}?start=login"
        >
            @{env.ITAM_EDU_FRONTEND_TG_USERNAME}
        </a>, чтобы получить код
    </footer>
</div>
