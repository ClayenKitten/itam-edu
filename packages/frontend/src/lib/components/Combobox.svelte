<script lang="ts" generics="T">
    import type { Snippet } from "svelte";

    let {
        query = $bindable(""),
        value = $bindable(null),
        suggestions,
        placeholder,
        isSelectable = () => true,
        selected,
        suggestion: suggestionSnippet,
        empty
    }: Props = $props();

    type Props = {
        /** Text query. */
        query: string;

        /** Selected item. */
        value: T | null;

        /**
         * List of items to display.
         *
         * These suggestions should be pre-filtered based on query and other
         * business rules.
         *
         * Suggestions are only displayed when query is not empty.
         * */
        suggestions: T[];

        /** Placeholder to display. */
        placeholder?: string;

        /**
         * Callback to determine whether the element should be selectable.
         *
         * @default
         * `() => true`
         */
        isSelectable?: (value: T) => boolean;

        /**
         * Snippet to display in place of input when value is selected.
         *
         * Consumer is responsible for providing a way to remove current value.
         * */
        selected: Snippet<[value: T]>;
        /** Snippet to display a suggestion. */
        suggestion: Snippet<
            [value: T, opts: { selectable: boolean; highlighted: boolean }]
        >;
        /** Snippet to display when nothing is found. */
        empty: Snippet;
    };

    let highlightedIndex: number = $state(-1);
    function handleKeyDown(e: KeyboardEvent) {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                highlightedIndex =
                    (highlightedIndex + 1) %
                    suggestions.slice(0, MAX_ELEMENTS).length;
                break;
            case "ArrowUp":
                e.preventDefault();
                highlightedIndex =
                    (highlightedIndex -
                        1 +
                        suggestions.slice(0, MAX_ELEMENTS).length) %
                    suggestions.slice(0, MAX_ELEMENTS).length;
                break;
            case "Enter":
                if (highlightedIndex >= 0) {
                    const chosen = suggestions.slice(0, MAX_ELEMENTS)[
                        highlightedIndex
                    ];
                    if (isSelectable(chosen)) {
                        value = chosen;
                        query = "";
                        highlightedIndex = -1;
                    }
                } else if (
                    suggestions.length > 0 &&
                    isSelectable(suggestions[0])
                ) {
                    value = suggestions[0];
                    query = "";
                }
                break;
            case "Escape":
                e.preventDefault();
        }
    }

    const MAX_ELEMENTS = 5;
</script>

<div class="relative">
    <div
        class={[
            "w-full h-11",
            value ? "" : "input-small",
            "border border-surface-border rounded-2xs overflow-hidden",
            query && "border-b-0 rounded-b-none"
        ]}
    >
        {#if value === null}
            <input
                class="size-full placeholder:text-on-surface-muted outline-0"
                type="search"
                {placeholder}
                bind:value={query}
                onkeydown={e => handleKeyDown(e)}
                autocomplete="off"
            />
        {:else}
            {@render selected(value)}
        {/if}
    </div>
    {#if query !== ""}
        <ul
            class={[
                "z-10 flex flex-col shadow absolute top-11 inset-x-0",
                "border border-t-0 border-surface-border rounded-b-2xs overflow-hidden"
            ]}
        >
            {#each suggestions.slice(0, MAX_ELEMENTS) as suggestion, i}
                {@const selectable = isSelectable(suggestion)}
                <button
                    class="contents"
                    onclick={() => {
                        value = suggestion;
                        query = "";
                        highlightedIndex = -1;
                    }}
                    disabled={!selectable}
                >
                    {@render suggestionSnippet(suggestion, {
                        selectable,
                        highlighted: highlightedIndex === i
                    })}
                </button>
            {:else}
                {@render empty()}
            {/each}
        </ul>
    {/if}
</div>
