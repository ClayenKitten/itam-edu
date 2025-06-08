<script lang="ts">
    import { goto } from "$app/navigation";
    import api from "$lib/api";

    const {} = $props();

    export function show() {
        dialog.showModal();
    }
    let dialog: HTMLDialogElement;

    let title: string = $state("");

    async function createCall() {
        const call = await api({ fetch }).calls.post({
            title
        });
        if (call.error) {
            alert(call.error.status);
            return;
        }
        await goto(`/calls/${call.data.id}`);
    }
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
        <h2 class="self-center">Новый звонок</h2>
    </header>
    <div class="flex flex-col gap-5">
        <label class="flex flex-col gap-2.5">
            <span>Название</span>
            <input class="input" bind:value={title} />
        </label>
        <button class="btn big" disabled={!title} onclick={createCall}>
            Начать звонок
        </button>
    </div>
</dialog>
