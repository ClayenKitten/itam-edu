<script lang="ts">
    import { invalidate } from "$app/navigation";
    import { page } from "$app/state";
    import api from "$lib/api";
    import { getToaster } from "$lib/Toaster.svelte";
    import type { Course, StaffMember } from "$lib/types";

    const { course }: Props = $props();
    type Props = { course: Course };

    export function show() {
        dialog.showModal();
    }
    let dialog: HTMLDialogElement;
    const toaster = getToaster();

    let role: StaffMember["role"] = $state("teacher");

    async function createInvite() {
        const result = await api({ fetch })
            .courses({ course: course.id })
            .invites.post({
                role
            });
        if (result.error) {
            toaster.add("Не удалось создать приглашение", "error");
            return;
        }
        const { code } = result.data;
        const url = page.url.origin + `/home?invite=${code}`;
        await window.navigator.clipboard.writeText(url);
        toaster.add("Ссылка-приглашение скопирована");
        await invalidate("app:invites");
        dialog.close();
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
>
    <header class="flex flex-col">
        <button
            class="self-end flex justify-center items-center h-8 w-8 border border-primary rounded-[8px]"
            aria-label="Закрыть"
            onclick={() => dialog.close()}
        >
            <i class="ph ph-x text-[12.5px]"></i>
        </button>
        <h2 class="self-center">Пригласить</h2>
    </header>
    <div class="flex flex-col gap-5">
        <label class="flex flex-col gap-2.5">
            <span>Роль</span>
            <select class="input" bind:value={role}>
                <option value="teacher">Преподаватель</option>
                <option value="admin">Администратор</option>
            </select>
        </label>
        <button class="btn big" onclick={createInvite}
            >Создать приглашение</button
        >
    </div>
</dialog>
