<script lang="ts" generics="T">
    import type { Snippet } from "svelte";
    import { dndzone, type DndEvent } from "svelte-dnd-action";

    let {
        items = $bindable(),
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
    } = $props();

    const handleConsider = (e: DndEvent<WrappedItem>) => {
        wrappedItems = e.items;
    };
    const handleFinalize = (e: DndEvent<WrappedItem>) => {
        wrappedItems = e.items;
        items = structuredClone(wrappedItems).map(x => x.item);
    };

    let wrappedItems = $state(
        structuredClone(items).map(item => ({ id: id(item), item }))
    );
    type WrappedItem = (typeof wrappedItems)[number];
</script>

<div
    class={[props.class]}
    use:dndzone={{
        morphDisabled: true,
        items: wrappedItems,
        type: "lessons",
        dropTargetStyle: {},
        dropTargetClasses: ["droptarget"]
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
