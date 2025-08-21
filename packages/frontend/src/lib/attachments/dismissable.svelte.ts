import type { Attachment } from "svelte/attachments";

/** Dismissable handles clicks outside of the attached element and Escape key to issue element. */
export function dismissable<T extends HTMLElement>(
    ondismiss: () => void
): Attachment<T> {
    return el => {
        const onWindowClick = (e: MouseEvent) => {
            if (!el.contains(e.target as Node)) {
                ondismiss();
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                ondismiss();
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
