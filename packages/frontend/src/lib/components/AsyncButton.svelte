<script lang="ts">
    import type { HTMLButtonAttributes } from "svelte/elements";
    import type { Snippet } from "svelte";

    type Base = Omit<HTMLButtonAttributes, "onclick" | "disabled">;

    interface Props extends Base {
        onclick?: (e: MouseEvent) => Promise<unknown>;
        onerror?: (error: unknown) => void;
        loading?: Snippet;
        disabled?: boolean;
        children?: Snippet;
    }

    let {
        children,
        loading,
        onclick,
        onerror,
        disabled = false,
        ...rest
    }: Props = $props();
    let busy = $state(false);

    async function handleClick(e: MouseEvent) {
        if (!onclick || busy) return;
        try {
            busy = true;
            await onclick(e);
        } catch (err) {
            onerror?.(err);
        } finally {
            busy = false;
        }
    }
</script>

<button {...rest} disabled={disabled || busy} onclick={handleClick}>
    {#if busy}
        {@render loading?.()}
    {:else}
        {@render children?.()}
    {/if}
</button>
