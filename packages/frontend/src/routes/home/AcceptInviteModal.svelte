<script lang="ts">
    import { invalidate } from "$app/navigation";
    import { page } from "$app/state";
    import api from "$lib/api";
    import { getToaster } from "$lib/Toaster.svelte";
    import type { Invite } from "$lib/types";
    import type { User } from "itam-edu-common";
    import { onMount } from "svelte";

    const { user }: Props = $props();
    type Props = { user: User | null };

    export function show() {
        dialog.showModal();
    }
    let dialog: HTMLDialogElement;
    const toaster = getToaster();

    let invite: Invite | null = $state(null);
    onMount(async () => {
        const code = page.url.searchParams.get("invite");
        if (!code) return;

        if (!user) {
            // TODO: show login window and continue after
            toaster.add(
                "Для принятия приглашения на курс требуется войти в аккаунт",
                "error",
                null
            );
            clearUrl();
            return;
        }
        const response = await api({ fetch }).courses.invites({ code }).get();
        if (response.error) {
            toaster.add(
                "Не удалось получить информацию о приглашении",
                "error",
                null
            );
            clearUrl();
            return;
        }
        if (user.isCourseMember(response.data.courseId)) {
            toaster.add(
                `Вы не можете принять приглашение, так как уже являетесь членом курса "${response.data.courseTitle}".`,
                "error",
                null
            );
            clearUrl();
            return;
        }
        invite = response.data;
        show();
    });

    async function redeem(invite: Invite) {
        const result = await api({ fetch })
            .courses.invites({ code: invite.code })
            .redeem.post();
        if (result.error) {
            toaster.add("Не удалось принять приглашение", "error");
            return;
        }
        toaster.add("Приглашение на курс принято");
        await Promise.all([invalidate("app:user"), invalidate("app:courses")]);
        dialog.close();
    }

    function clearUrl() {
        let url = page.url;
        url.searchParams.delete("invite");
        history.replaceState(null, "", url);
    }
</script>

<dialog
    class={[
        "modal",
        "hidden open:flex flex-col gap-7.5 w-150 max-h-150 px-10 pt-10 pb-12.5 m-auto",
        "text-on-surface bg-surface rounded-xl",
        "backdrop:bg-[black] backdrop:opacity-30"
    ]}
    bind:this={dialog}
    onclose={clearUrl}
>
    <header class="flex flex-col">
        <button
            class="self-end flex justify-center items-center h-8 w-8 border border-primary rounded-[8px]"
            aria-label="Закрыть"
            onclick={() => dialog.close()}
        >
            <i class="ph ph-x text-[12.5px]"></i>
        </button>
        <h2 class="self-center">Приглашение на курс</h2>
    </header>
    {#if user && invite}
        <div class="flex flex-col gap-5">
            <p class="text-center text-lg-regular">
                Вы приглашены на курс "{invite.courseTitle}" в роли
                {#if invite.role === "admin"}
                    администратора.
                {:else if invite.role === "teacher"}
                    преподавателя.
                {/if}.
            </p>
            <button class="btn big" onclick={() => redeem(invite!)}>
                Принять
            </button>
        </div>
    {/if}
</dialog>
