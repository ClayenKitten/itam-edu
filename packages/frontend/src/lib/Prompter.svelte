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

        public async show<
            COMP extends Component<Record<string, unknown> & PromptProps>
        >(
            component: COMP,
            props: Omit<ComponentProps<COMP>, "onConfirm" | "onCancel">
        ): Promise<PromptReturnType<COMP> | null> {
            const { promise, resolve } =
                Promise.withResolvers<PromptReturnType<COMP> | null>();
            let onConfirm = (data: PromptReturnType<COMP>) => resolve(data);
            let onCancel = () => resolve(null);

            const key = this.add(component, {
                ...props,
                onConfirm,
                onCancel
            });

            try {
                const result = await promise;
                this.remove(key);
                return result;
            } catch (e) {
                this.remove(key);
                throw e;
            }
        }

        /**
         * Adds component to the displayed list.
         *
         * @returns key
         * */
        public add<
            PROPS extends Record<string, unknown>,
            COMP extends Component<PROPS>
        >(component: COMP, props: PROPS): string {
            const key = crypto.randomUUID();
            this.#components.set(key, {
                component,
                props
            });
            return key;
        }

        /** Removes component from the displayed list by key.*/
        public remove(key: string) {
            this.#components.delete(key);
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

    // export type PromptComponent<
    //     RET,
    //     PROPS extends PromptProps<RET>
    // > = Component<PROPS>;
    export type PromptReturnType<COMP extends Component<PromptProps>> =
        Parameters<ComponentProps<COMP>["onConfirm"]>[0];
    export type PromptProps<RET = unknown> = {
        onConfirm: (data: RET) => void;
        onCancel: () => void;
    };
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
