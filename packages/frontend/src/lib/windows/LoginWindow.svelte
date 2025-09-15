<script lang="ts">
    import { invalidate, replaceState } from "$app/navigation";
    import { page } from "$app/state";
    import { env } from "$env/dynamic/public";
    import api from "$lib/api";
    import { getToaster } from "$lib/Toaster.svelte";

    export function show() {
        code = "";
        dialog.showModal();
        input.focus();
    }
    $effect(() => {
        let setCode = page.url.searchParams.get("login");
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

    const toaster = getToaster();
    const login = async () => {
        if (!code) return;
        const resp = await api({ fetch }).users.sessions.post({
            code: code.toUpperCase()
        });

        if (resp.error) {
            toaster.add("Авторизация не удалась", "error");
            return;
        }
        toaster.add("Авторизация успешна");
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
    onclose={() => {
        let url = page.url;
        url.searchParams.delete("login");
        replaceState(url, {});
    }}
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
        <span class="text-md-medium text-on-surface-muted"
            >Код от телеграм-бота</span
        >
        <input
            class="h-17 text-on-background text-lg-regular px-5 border border-primary rounded-sm"
            bind:value={code}
            bind:this={input}
        />
    </label>
    <button class="btn big" disabled={!code} onclick={login}> Войти </button>
    <footer class="text-xl-medium text-center">
        Напишите
        <a
            class="text-primary underline"
            target="_blank"
            href="https://t.me/{env.ITAMEDU_PUBLIC_TELEGRAM_BOT_USERNAME}?start=login"
        >
            @{env.ITAMEDU_PUBLIC_TELEGRAM_BOT_USERNAME}
        </a>, чтобы получить код
    </footer>
</dialog>
