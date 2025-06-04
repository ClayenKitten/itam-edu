<script lang="ts">
    import { invalidate } from "$app/navigation";
    import { page } from "$app/state";
    import { env } from "$env/dynamic/public";
    import api from "$lib/api";

    export function show() {
        code = "";
        dialog.showModal();
        input.focus();
    }
    $effect(() => {
        let setCode = page.url.searchParams.get("code");
        if (setCode) {
            code = setCode;
        }
        if (page.url.searchParams.has("login")) {
            dialog.showModal();
            input.focus();
        }
    });
    let dialog: HTMLDialogElement;

    let code: string = $state("");
    let input: HTMLInputElement;

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
        dialog.close();
    };
</script>

<dialog
    class={[
        "modal",
        "hidden open:flex flex-col gap-5 w-150 px-10 pt-10 pb-12.5 m-auto text-on-surface bg-surface rounded-xl",
        "backdrop:bg-[black] backdrop:opacity-30"
    ]}
    bind:this={dialog}
>
    <header class="flex flex-col">
        <button
            class="self-end flex justify-center items-center h-8 w-8 border border-primary rounded-[8px]"
            aria-label="Закрыть"
            onclick={() => dialog.close()}
        >
            <i class="ph ph-x text-[12.5px]"></i>
        </button>
        <h2 class="self-center">Вход</h2>
    </header>
    <label class="flex flex-col gap-1.5">
        <span class="text-on-surface-muted text-button">Код</span>
        <input
            class="h-17 text-on-background text-comment px-5 border border-primary rounded-sm"
            bind:value={code}
            bind:this={input}
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
</dialog>
