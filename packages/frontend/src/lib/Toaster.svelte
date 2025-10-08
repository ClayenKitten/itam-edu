<script lang="ts" module>
    import { getContext, setContext } from "svelte";
    import { SvelteMap } from "svelte/reactivity";
    import { fade } from "svelte/transition";

    /** Toast notifications manager. */
    export class Toaster {
        #toasts: ToastInfo[] = $state([]);
        #timers: Map<string, number> = new SvelteMap();

        public get toasts(): ToastInfo[] {
            return this.#toasts;
        }

        /** Shows toast notification. */
        public add(
            message: string,
            kind: ToastKind = "success",
            durationMs: number | null = 5000
        ): string {
            const id = crypto.randomUUID();
            this.#toasts.push({ id, kind, message });
            if (durationMs) this.setRemoveTimeout(id, durationMs);
            return id;
        }

        /** Removes toast notification. */
        public remove(id: string) {
            this.#toasts = this.#toasts.filter(t => t.id !== id);
            this.deleteRemoveTimeout(id);
        }

        protected setRemoveTimeout(id: string, durationMs: number) {
            this.#timers.set(
                id,
                window.setTimeout(() => {
                    this.remove(id);
                }, durationMs)
            );
        }

        protected deleteRemoveTimeout(id: string) {
            const timer = this.#timers.get(id);
            if (timer) {
                clearTimeout(timer);
                this.#timers.delete(id);
            }
        }
    }

    export type ToastInfo = {
        id: string;
        kind: ToastKind;
        message: string;
    };
    export type ToastKind = "success" | "error";

    const toasterKey = Symbol();
    export function getToaster(): Toaster {
        return getContext(toasterKey);
    }
    export function createToaster(): Toaster {
        return setContext(toasterKey, new Toaster());
    }
</script>

<script lang="ts">
    const { toaster }: { toaster: Toaster } = $props();
</script>

<div
    class={[
        toaster.toasts.length > 0 ? "flex" : "hidden",
        "fixed bottom-0 right-0 z-10 p-4",
        "flex-col justify-end items-end gap-4"
    ]}
>
    {#each toaster.toasts as toast (toast.id)}
        <button
            class={[
                "flex items-start gap-4 py-4 px-6 max-w-120",
                "border text-xl-medium rounded-md shadow",
                toast.kind === "success" &&
                    "bg-on-success text-success border-success-border",
                toast.kind === "error" &&
                    "bg-on-danger text-danger border-danger-border"
            ]}
            onclick={() => toaster.remove(toast.id)}
            transition:fade
        >
            {#if toast.kind === "success"}
                <i class="ph ph-check-circle text-[28px]"></i>
            {:else if toast.kind === "error"}
                <i class="ph ph-x-circle text-[28px]"></i>
            {/if}
            <div class="text-start break-words overflow-hidden">
                {toast.message}
            </div>
        </button>
    {/each}
</div>
