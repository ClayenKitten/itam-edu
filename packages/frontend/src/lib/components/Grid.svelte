<script lang="ts" module>
    import type { ClassValue } from "svelte/elements";
    import type { Snippet } from "svelte";

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
    let {
        items,
        columns,
        headerSeparator = true,
        gap,
        page = $bindable(0),
        pageSize = null,
        empty
    }: Props = $props();

    type Props = {
        items: T[];
        gap?: number | { x: number; y: number };
        headerSeparator?: boolean;
        columns: C;
        pageSize?: number | null;
        page?: number;
        empty?: Snippet<[]>;
    };

    const template = $derived(
        Object.values(columns)
            .map(c => c.size)
            .join(" ")
    );

    const gapX = typeof gap === "object" ? `${gap.x}px` : `${gap ?? 24}px`;
    const gapY = typeof gap === "object" ? `${gap.y}px` : `${gap ?? 12}px`;

    const totalPages = $derived.by(() =>
        pageSize && pageSize > 0
            ? Math.max(1, Math.ceil(items.length / pageSize))
            : 1
    );
    const pageItems = $derived.by(() =>
        pageSize && pageSize > 0
            ? items.slice(page * pageSize, page * pageSize + pageSize)
            : items
    );
    function goTo(p: number) {
        if (!pageSize || pageSize <= 0) return;
        page = Math.min(Math.max(0, p), totalPages - 1);
    }
</script>

<article class="flex flex-col gap-2">
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
        {#if pageItems.length > 0}
            {#each pageItems as item}
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
    {#if pageSize && pageSize > 0}
        <nav
            class="self-end mt-3 flex items-center gap-1.5 text-sm text-on-surface-muted"
        >
            <button
                class={[
                    "size-10 flex justify-center items-center",
                    "border border-surface-border rounded-2xs",
                    "bg-surface disabled:bg-surface-dimmed shadow",
                    "disabled:cursor-not-allowed"
                ]}
                onclick={() => goTo(0)}
                disabled={page === 0}
                aria-label="Первая страница"
            >
                <i class="ph ph-caret-double-left"></i>
            </button>
            <button
                class={[
                    "size-10 flex justify-center items-center",
                    "border border-surface-border rounded-2xs",
                    "bg-surface disabled:bg-surface-dimmed shadow",
                    "disabled:cursor-not-allowed"
                ]}
                onclick={() => goTo(page - 1)}
                disabled={page === 0}
                aria-label="Previous page"
            >
                <i class="ph ph-caret-left"></i>
            </button>
            <p class="mx-2">{page + 1}&ThinSpace;/&ThinSpace;{totalPages}</p>
            <button
                class={[
                    "size-10 flex justify-center items-center",
                    "border border-surface-border rounded-2xs",
                    "bg-surface disabled:bg-surface-dimmed shadow",
                    "disabled:cursor-not-allowed"
                ]}
                onclick={() => goTo(page + 1)}
                disabled={page === totalPages - 1}
                aria-label="Следующая страница"
            >
                <i class="ph ph-caret-right"></i>
            </button>
            <button
                class={[
                    "size-10 flex justify-center items-center",
                    "border border-surface-border rounded-2xs",
                    "bg-surface disabled:bg-surface-dimmed shadow",
                    "disabled:cursor-not-allowed"
                ]}
                onclick={() => goTo(totalPages - 1)}
                disabled={page === totalPages - 1}
                aria-label="Последняя страница"
            >
                <i class="ph ph-caret-double-right"></i>
            </button>
        </nav>
    {/if}
</article>
