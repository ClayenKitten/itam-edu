<script lang="ts">
    import { MyWindow } from ".";
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
        <h2 class="self-start">Календарь</h2>
    </header>
    <div class="h-60"></div>
</div>
