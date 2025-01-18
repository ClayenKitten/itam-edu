<script lang="ts">
    import { goto, invalidate } from "$app/navigation";
    import { env } from "$env/dynamic/public";
    import api from "$lib/api.js";

    const { data } = $props();

    let code = $state(data.code ?? "");

    const login = async () => {
        const resp = await api({
            fetch,
            toast: resp => ({
                title: resp.status === 200 ? "Welcome back!" : "Sign-in Failed"
            })
        }).users.me.session.post({
            code: code.toUpperCase()
        });
        if (resp.error) {
            console.log(resp.error);
            // TODO: use toast notification
            alert("Sign-in Failed");
            return;
        }
        await invalidate("app:user");
        await goto(data.redirect);
    };

    const botUrl = `https://t.me/${env.PUBLIC_ITAM_EDU_WEB_TG_USERNAME!}?start=login`;
</script>

<svelte:head>
    <title>ITAM.Education / Sign in</title>
</svelte:head>

<!-- TODO: use picture for desktop background -->
<div
    class="flex justify-center items-center w-full h-full text-text md:bg-zinc-950"
>
    <section
        class="flex flex-col items-stretch gap-10 w-full h-full px-6 py-10 md:w-[480px] md:h-min bg-surface md:rounded"
    >
        <header class="mb-auto">
            <h1 class="text-2xl font-bold">Sign in</h1>
        </header>
        <main class="flex flex-col items-stretch gap-6">
            <label class="flex flex-col gap-1.5">
                <span class="text-xs font-bold">Code</span>
                <input bind:value={code} />
            </label>
            <button
                class="btn"
                disabled={!/^[a-zA-Z0-9]+$/.test(code)}
                onclick={login}
            >
                Sign in
            </button>
        </main>
        <p class="text-lg text-center mt-auto">
            Contact
            <a
                class="text-primary-light underline underline-offset-4 hover:opacity-90"
                target="_blank"
                href={botUrl}
            >
                @{env.PUBLIC_ITAM_EDU_WEB_TG_USERNAME!}
            </a>
            to get a sign-in code
        </p>
    </section>
</div>
