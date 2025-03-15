<script lang="ts">
    import { page } from "$app/state";
    import type { Component } from "svelte";
    import { MyWindow } from ".";

    const window = $derived(MyWindow.fromSearchParams(page.url.searchParams));
    const WindowComponent: Component | undefined = $derived(window?.component);
    const WindowProps = $derived(window?.properties);
</script>

{#if window}
    <div
        class="backdrop absolute inset-0 bg-[black] opacity-50"
        aria-hidden="true"
    ></div>
    <div class="window absolute inset-0 flex justify-center items-center">
        <WindowComponent {...WindowProps} />
    </div>
{/if}

<style>
    :global(body:has(.window)) {
        height: 100%;
        overflow: hidden;
    }
</style>
