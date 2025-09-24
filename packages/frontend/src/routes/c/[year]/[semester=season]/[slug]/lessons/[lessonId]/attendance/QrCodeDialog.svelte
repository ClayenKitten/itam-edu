<script lang="ts">
    import { invalidate } from "$app/navigation";
    import { env } from "$env/dynamic/public";
    import api from "$lib/api";
    import Loader from "$lib/components/Loader.svelte";
    import type { Course, Lesson } from "$lib/types";
    import { qr } from "@svelte-put/qr/svg";

    const { course, lesson }: Props = $props();
    type Props = {
        course: Course;
        lesson: Lesson;
    };

    let token: string | null = $state(null);
    let page: "attendance" | "tg-bot" = $state("attendance");

    const createToken = async () => {
        const result = await api({ fetch })
            .courses({ course: course.id })
            .lessons({ lesson: lesson.id })
            ["attendance-tokens"].post();
        if (result.error) {
            alert(result.status);
            return null;
        }
        return result.data;
    };

    let timer: number | null = $state(null);
    export function show() {
        dialog.showModal();
        timer = window.setInterval(
            async () => (token = await createToken()),
            5000
        );
        createToken().then(t => {
            token = t;
        });
    }
    let dialog: HTMLDialogElement;
</script>

<dialog
    class={[
        "modal h-dvh max-h-dvh w-dvw max-w-dvw",
        "hidden open:flex flex-col gap-7.5 p-10 m-0 inset-0",
        "text-on-surface bg-surface",
        "backdrop:bg-[black] backdrop:opacity-30"
    ]}
    bind:this={dialog}
    onclose={async () => {
        if (timer) {
            window.clearInterval(timer);
        }
        token = null;
        page = "attendance";
        await invalidate("app:attendees");
    }}
>
    <header class="flex justify-between">
        <h2>Посещение урока {lesson.position + 1}. {lesson.title}</h2>
        <button aria-label="Закрыть окно" onclick={() => dialog.close()}>
            <i class="ph ph-x text-[30px]"></i>
        </button>
    </header>
    <div
        class="flex-1 self-center aspect-square p-4 border border-surface-border shadow rounded-md"
    >
        {#if page === "attendance"}
            {#if token}
                <svg
                    use:qr={{
                        data: token,
                        logo: "/favicon.png",
                        shape: "square"
                    }}
                    aria-label="QR-код"
                />
            {:else}
                <Loader />
            {/if}
        {:else if page === "tg-bot"}
            <svg
                use:qr={{
                    data: `https://t.me/${env.ITAMEDU_PUBLIC_TELEGRAM_BOT_USERNAME}`,
                    logo: "/telegram.png",
                    shape: "square"
                }}
                aria-label="QR-код"
            />
        {/if}
    </div>
    <p class="self-center flex text-xl-medium text-on-surface-contrast">
        {#if page === "attendance"}
            <span>Отсканируйте QR-код в Telegram-боте</span>
            <button
                class="flex items-center ml-1 text-primary"
                onclick={() => (page = "tg-bot")}
            >
                <i class="ph ph-qr-code text-[21px]"></i>
                <span class="hover:underline">
                    {env.ITAMEDU_PUBLIC_TELEGRAM_BOT_USERNAME}
                </span>
            </button>
        {:else if page === "tg-bot"}
            <button
                class="flex items-center ml-1 text-primary"
                onclick={() => (page = "attendance")}
            >
                <i class="ph ph-caret-left text-[21px]"></i>
                <span class="hover:underline">Назад</span>
            </button>
        {/if}
    </p>
</dialog>
