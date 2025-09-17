<script lang="ts">
    import { type PromptProps } from "$lib/Prompter.svelte";
    import { onMount } from "svelte";

    const { initialUrl, onConfirm, onCancel }: Props = $props();
    type Props = PromptProps<Result> & {
        initialUrl?: string;
    };

    type Result = { url: string };

    let url = $state(initialUrl ?? "");

    let dialog: HTMLDialogElement;
    onMount(() => {
        dialog.showModal();
    });
</script>

<dialog
    class={[
        "modal",
        "hidden open:flex flex-col gap-5 w-150 p-6 m-auto text-on-surface bg-surface rounded-md",
        "backdrop:bg-[black] backdrop:opacity-30"
    ]}
    onclose={onCancel}
    bind:this={dialog}
>
    <h4>Ссылка</h4>
    <label class="flex flex-col gap-2">
        <h5>URL</h5>
        <input
            class="input"
            placeholder="https://example.com..."
            bind:value={url}
            onkeydown={e => {
                if (e.key === "Enter") {
                    onConfirm({ url });
                }
            }}
        />
    </label>
    <menu class="flex justify-end gap-2">
        <button class="btn secondary" onclick={() => dialog.close()}>
            Отмена
        </button>
        <button class="btn" onclick={() => onConfirm({ url })}>
            Подтвердить
        </button>
    </menu>
</dialog>
