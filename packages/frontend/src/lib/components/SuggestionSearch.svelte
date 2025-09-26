<script lang="ts" generics="T">
    import type { Snippet } from "svelte";

    let {
        query = $bindable(""),
        suggestions,
        placeholder,
        onSelect,
        isSelectable = () => true,
        suggestion: suggestionSnippet,
        empty
    }: Props = $props();

    type Props = {
        /** Text query. */
        query: string;

        /**
         * List of items to suggest.
         *
         * These suggestions should be pre-filtered based on query and other
         * business rules.
         *
         * Suggestions are only displayed when query is not empty.
         * */
        suggestions: T[];

        /** Placeholder to display. */
        placeholder?: string;

        /** Callback that will be called when element is selected. */
        onSelect?: (item: T) => void;

        /**
         * Callback to determine whether the element should be selectable.
         *
         * @default
         * `() => true`
         */
        isSelectable?: (item: T) => boolean;

        /** Snippet to display a suggestion. */
        suggestion: Snippet<[item: T, opts: { selectable: boolean }]>;

        /** Snippet to display when nothing is found. */
        empty: Snippet;
    };

    const MAX_ELEMENTS = 5;
</script>

<div class="relative">
    <input
        class={["input-small w-full", query && "border-b-0 rounded-b-none"]}
        type="search"
        {placeholder}
        bind:value={query}
        onkeydown={e => {
            if (e.key !== "Enter") return;
            if (suggestions.length === 0) return;
            if (!isSelectable(suggestions[0])) return;
            onSelect?.(suggestions[0]);
        }}
        autocomplete="off"
    />
    {#if query !== ""}
        <ul
            class={[
                "z-10 flex flex-col shadow absolute top-11 inset-x-0",
                "border border-t-0 border-surface-border rounded-b-2xs overflow-hidden"
            ]}
        >
            {#each suggestions.slice(0, MAX_ELEMENTS) as suggestion}
                {@const selectable = isSelectable(suggestion)}
                <button
                    class="contents"
                    onclick={() => onSelect?.(suggestion)}
                    disabled={!selectable}
                >
                    {@render suggestionSnippet(suggestion, { selectable })}
                </button>
            {:else}
                {@render empty()}
            {/each}
        </ul>
    {/if}
</div>
