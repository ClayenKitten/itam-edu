import type { Attachment } from "svelte/attachments";

/**
 * Dismissable handles clicks outside of the attached element and Escape key to issue element.
 *
 * @example
 * ```
 * <details
 *     class="group relative"
 *     {@attach dismissable<HTMLDetailsElement>(function() {
 *         this.open = false;
 *     })}
 * >
 *     // ...
 * </details>
 * ```
 * */
export function dismissable<T extends HTMLElement>(
    ondismiss: (this: T) => void,
    options?: {
        /**
         * Dismiss even on clicks withing the element.
         *
         * Useful for button clicks.
         *
         * @default false
         */
        dismissOnClickWithin?: boolean;
    }
): Attachment<T> {
    return el => {
        const onWindowClick = (e: MouseEvent) => {
            if (options?.dismissOnClickWithin === true) {
                ondismiss.call(el);
            } else if (!el.contains(e.target as Node)) {
                ondismiss.call(el);
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                ondismiss.call(el);
            }
        };

        // Use timeout to avoid immediate dismiss upon attachment
        setTimeout(() => {
            window.addEventListener("click", onWindowClick);
            window.addEventListener("keydown", onKeyDown);
        }, 1);
        return () => {
            window.removeEventListener("click", onWindowClick);
            window.removeEventListener("keydown", onKeyDown);
        };
    };
}
