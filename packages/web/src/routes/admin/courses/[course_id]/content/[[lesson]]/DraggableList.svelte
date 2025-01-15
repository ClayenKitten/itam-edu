<script lang="ts" generics="T">
    import type { Snippet } from "svelte";
    import { dndzone, type DndEvent } from "svelte-dnd-action";

    let {
        items,
        id,
        children,
        empty,
        ...props
    }: {
        items: T[];
        id: (item: T) => number | string;
        children: Snippet<[T]>;
        empty?: Snippet;
        class?: string;
        handleConsider?: (e: DndEvent<T>) => void;
        handleFinalize?: (e: DndEvent<T>) => void;
        dragDisabled?: boolean;
    } = $props();

    const handleConsider = (e: DndEvent<WrappedItem>) => {
        wrappedItems = e.items;
        props.handleConsider?.({
            info: e.info,
            items: e.items.map(x => x.item)
        });
    };
    const handleFinalize = (e: DndEvent<WrappedItem>) => {
        wrappedItems = e.items;
        items = wrappedItems.map(x => x.item);
        props.handleFinalize?.({
            info: e.info,
            items: e.items.map(x => x.item)
        });
    };

    let wrappedItems = $derived(items.map(item => ({ id: id(item), item })));
    type WrappedItem = (typeof wrappedItems)[number];
</script>

<div
    class={[props.class]}
    use:dndzone={{
        morphDisabled: true,
        items: wrappedItems,
        type: "lessons",
        dropTargetStyle: {},
        dropTargetClasses: ["droptarget"],
        dragDisabled: props.dragDisabled
    }}
    onconsider={e => handleConsider(e.detail)}
    onfinalize={e => handleFinalize(e.detail)}
>
    {#each wrappedItems as wrappedItem (wrappedItem.id)}
        {@render children(wrappedItem.item)}
    {:else}
        {@render empty?.()}
    {/each}
</div>
