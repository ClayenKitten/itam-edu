import Sortable, { type SortableEvent } from "sortablejs";
import type { Action } from "svelte/action";

export const sortable: Action<HTMLElement, SortableParams, SortableAttrs> = (
    node,
    params
) => {
    let sortable: Sortable;

    $effect(() => {
        sortable = Sortable.create(node, {
            handle: params.handle,
            animation: params.animation,
            onUpdate: e => dispatch("sortchanged", node, sortable, e)
        });

        return () => {
            sortable.destroy();
        };
    });
};

const dispatch = (
    event: "sortchanged",
    node: HTMLElement,
    sortable: Sortable,
    baseEvent: SortableEvent
) => {
    node.dispatchEvent(
        new CustomEvent(event, { detail: { ...baseEvent, sortable } })
    );
};

export type SortableParams = Sortable.Options;

/**
 * Events that are fired by an instance.
 *
 * NOTE: Don't use the same event name as the one used by Sortable,
 * or their events will be handled first.
 * */
export type SortableAttrs = {
    onsortchanged: (e: CustomEvent<EventPayload>) => void;
    // Add more as needed
};

type EventPayload = Omit<SortableEvent, keyof Event> & {
    sortable: Sortable;
};
