<script lang="ts" module>
    import { getContext, setContext, type Snippet } from "svelte";

    export class ContextMenuManager {
        #menu = $state<MenuState<unknown> | null>(null);

        get menu(): MenuState<unknown> | null {
            return this.#menu;
        }

        show<T>(ev: MouseEvent, snippet: Snippet<[T]>, props: T) {
            ev.preventDefault();
            ev.stopPropagation();
            this.#menu = {
                x: ev.clientX,
                y: ev.clientY,
                snippet: snippet as Snippet<[unknown]>,
                props
            };

            queueMicrotask(() => {
                const el = document.getElementById("context-menu");
                if (!el || !this.#menu) return;

                const rect = el.getBoundingClientRect();
                const overflowX = Math.max(0, rect.right - window.innerWidth);
                if (overflowX > 0) {
                    this.#menu.x -= overflowX;
                }
            });

            document.addEventListener("click", this.#onClickOutside);
            document.addEventListener("contextmenu", this.#onCtxMenu);
            document.addEventListener("keydown", this.#onEsc);
        }

        close() {
            this.#menu = null;
            document.removeEventListener("click", this.#onClickOutside);
            document.removeEventListener("contextmenu", this.#onCtxMenu);
            document.removeEventListener("keydown", this.#onEsc);
        }

        #onClickOutside = (e: MouseEvent) => {
            const el = document.getElementById("context-menu");
            if (el && !el.contains(e.target as Node)) this.close();
        };
        #onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                this.close();
            }
        };
        #onCtxMenu = () => {
            this.close();
        };
    }

    export type MenuState<T> = {
        x: number;
        y: number;
        props: T;
        /**
         * Snippet to render.
         *
         * It must take a single argument, as Svelte doesn't support spreading generic arguments list.
         */
        snippet: Snippet<[T]>;
    };

    const key = Symbol();
    export function useContextMenu(): ContextMenuManager {
        return getContext(key);
    }
    export function createContextMenuManager(): ContextMenuManager {
        return setContext(key, new ContextMenuManager());
    }
</script>

<script lang="ts">
    const { contextMenuManager }: { contextMenuManager: ContextMenuManager } =
        $props();
</script>

{#if contextMenuManager.menu}
    {@const menu = contextMenuManager.menu}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        id="context-menu"
        class="absolute z-50"
        style={`top:${menu.y}px; left:${menu.x}px`}
        onclick={() => {
            contextMenuManager.close();
        }}
    >
        {@render menu.snippet(menu.props)}
    </div>
{/if}
