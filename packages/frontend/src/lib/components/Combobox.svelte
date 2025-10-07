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
        empty,
        alignRight = false
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

        /** Snippet to display in place of input when value is selected. */
        selected: Snippet<[value: T]>;
        /** Snippet to display a suggestion. */
        suggestion: Snippet<
            [value: T, opts: { selectable: boolean; highlighted: boolean }]
        >;
        /** Snippet to display when nothing is found. */
        empty: Snippet;

        /** Whether to pin suggestion box to the right instead of to the left. */
        alignRight?: boolean;
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

<div class="relative flex-1 shrink-1 basis-0 min-w-0">
    <div
        class={[
            "w-full h-11 overflow-hidden",
            value ? "" : "input-small",
            "border border-surface-border rounded-2xs"
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
            <div class="flex">
                <div class="flex-1 overflow-hidden">
                    {@render selected(value)}
                </div>
                <button
                    class="shrink-0 self-center p-2 mr-1 rounded-full hover:bg-surface-tint"
                    aria-label="Удалить"
                    onclick={() => (value = null)}
                >
                    <i class="ph ph-x"></i>
                </button>
            </div>
        {/if}
    </div>
    {#if query !== ""}
        <ul
            class={[
                "z-10 flex flex-col absolute top-12 min-w-max w-full",
                "border border-surface-border rounded-2xs shadow overflow-hidden",
                alignRight ? "right-0" : "left-0"
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
