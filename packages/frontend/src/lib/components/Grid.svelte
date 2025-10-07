<script lang="ts" module>
    interface ColumnInfo<T> {
        /** Visible column label. */
        label: string;
        /** CSS track size e.g. 'minmax(300px, 1fr)' or 'max-content' */
        size: string;
        headerClass?: ClassValue;
        cellClass?: ClassValue;
        cell: Snippet<[T]>;
    }
</script>

<script lang="ts" generics="T, C extends Record<string, ColumnInfo<T>>">
    import type { ClassValue } from "svelte/elements";
    import type { Snippet } from "svelte";

    let {
        items,
        columns,
        headerSeparator = true,
        gap,
        empty
    }: Props = $props();

    type Props = {
        items: T[];
        gap?: number | { x: number; y: number };
        headerSeparator?: boolean;
        columns: C;
        empty?: Snippet<[]>;
    };

    const template = $derived(
        Object.values(columns)
            .map(c => c.size)
            .join(" ")
    );

    const gapX = typeof gap === "object" ? `${gap.x}px` : `${gap ?? 24}px`;
    const gapY = typeof gap === "object" ? `${gap.y}px` : `${gap ?? 12}px`;
</script>

<div
    class="grid items-center"
    style:grid-template-columns={template}
    style:column-gap={gapX}
    style:row-gap={gapY}
>
    <header class="contents text-md-medium text-on-surface-muted">
        {#each Object.values(columns) as col}
            <div class={col.headerClass}>
                {col.label}
            </div>
        {/each}
        {#if headerSeparator}
            <hr class="border-surface-border my-1 col-span-full" />
        {/if}
    </header>
    {#if items.length > 0}
        {#each items as item}
            {#each Object.values(columns) as col}
                <div class={col.cellClass}>
                    {@render col.cell(item)}
                </div>
            {/each}
        {/each}
    {:else}
        {@render empty?.()}
    {/if}
</div>
