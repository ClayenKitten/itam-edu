<script lang="ts">
    export const prompt = async () => {
        return new Promise(resolve => {
            onConfirm = param => resolve(param);
            onClose = () => resolve(null);
        });
    };

    type Result = { text: string; url: string };

    let onConfirm: ((result: Result) => void) | undefined = $state();
    let onClose: (() => void) | undefined = $state();

    let dialog: HTMLDialogElement | undefined = $state();
</script>

<dialog
    class={[
        "modal",
        "hidden open:flex flex-col gap-5 w-150 px-10 pt-10 pb-12.5 m-auto text-on-surface bg-surface rounded-xl",
        "backdrop:bg-[black] backdrop:opacity-30"
    ]}
    onclose={onClose}
    bind:this={dialog}
>
    <div class="flex flex-col gap-4">
        <label class="flex flex-col gap-2">
            <span>Текст</span>
            <input type="text" />
        </label>
        <label class="flex flex-col gap-2">
            <span>URL</span>
            <input type="text" />
        </label>
        <button onclick={() => onConfirm?.({ text: "", url: "" })}>
            Подтвердить
        </button>
    </div>
</dialog>
