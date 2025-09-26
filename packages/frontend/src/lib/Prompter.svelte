<script lang="ts" module>
    import {
        getContext,
        setContext,
        type Component,
        type ComponentProps
    } from "svelte";
    import { SvelteMap } from "svelte/reactivity";

    /** Prompt modals manager. */
    export class Prompter {
        #components: Map<
            string,
            {
                component: Component<any>;
                props: Record<string, unknown>;
            }
        > = new SvelteMap();

        public get components() {
            return this.#components.values();
        }

        public async show<PROPS extends PromptProps<any>>(
            component: Component<PROPS>,
            props: Omit<PROPS, keyof PromptProps<any>>
        ): Promise<RetOf<PROPS> | null> {
            const { promise, resolve } =
                Promise.withResolvers<RetOf<PROPS> | null>();
            let onConfirm = (data: RetOf<PROPS>) => resolve(data);
            let onCancel = () => resolve(null);

            const key = crypto.randomUUID();
            this.#components.set(key, {
                component,
                props: { ...props, onConfirm, onCancel }
            });

            try {
                const result = await promise;
                this.#components.delete(key);
                return result;
            } catch (e) {
                this.#components.delete(key);
                throw e;
            }
        }
    }

    const prompterKey = Symbol();
    export function getPrompter(): Prompter {
        return getContext(prompterKey);
    }
    export function createPrompter() {
        const prompter = new Prompter();
        return setContext(prompterKey, prompter);
    }

    export type PromptProps<RET> = {
        onConfirm: (data: RET) => void;
        onCancel: () => void;
    };
    type RetOf<P> = P extends PromptProps<infer R> ? R : never;
</script>

<script lang="ts">
    const { prompter }: Props = $props();

    type Props = { prompter: Prompter };
</script>

<div>
    {#each prompter.components as { component: Component, props }}
        <Component {...props} />
    {/each}
</div>
