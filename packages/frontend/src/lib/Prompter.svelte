<script lang="ts" module>
    import {
        flushSync,
        getContext,
        mount,
        setContext,
        unmount,
        type Component
    } from "svelte";

    /** Toast notifications manager. */
    export class Prompter {
        public element: HTMLElement | null = null;
        protected activePrompt: Promise<unknown> | null = null;

        /** Shows toast notification. */
        public async prompt<PROPS extends Record<string, unknown>, RET>(
            component: PromptComponent<PROPS, RET>,
            props: PROPS
        ): Promise<RET | null> {
            if (this.activePrompt !== null) {
                console.error(
                    "Tried to prompt while another prompt is active."
                );
                return null;
            }
            if (this.element === null) {
                console.error(
                    "Prompt called before container element was not provided."
                );
                return null;
            }

            const mountedComponent = mount(component, {
                props,
                target: this.element
            });
            flushSync();

            try {
                const result = await mountedComponent.prompt();
                this.activePrompt = null;
                await unmount(mountedComponent);
                return result;
            } catch (e) {
                this.activePrompt = null;
                throw e;
            }
        }
    }

    export type PromptComponent<
        PROPS extends Record<string, unknown>,
        RET
    > = Component<PROPS, { prompt: () => Promise<RET | null> }>;

    const prompterKey = Symbol();
    export function getPrompter(): Prompter {
        return getContext(prompterKey);
    }
    export function createPrompter() {
        const prompter = new Prompter();
        return setContext(prompterKey, prompter);
    }

    export function makePrompt() {
        return {
            onLoad: () => {},
            onLoad: () => {}
        }
    }
</script>

<script lang="ts">
    const { prompter }: Props = $props();

    type Props = { prompter: Prompter };

    let element: HTMLElement | undefined = $state();
    $effect(() => {
        if (!element) return;
        prompter.element = element;
    });
</script>

<div bind:this={element}></div>
