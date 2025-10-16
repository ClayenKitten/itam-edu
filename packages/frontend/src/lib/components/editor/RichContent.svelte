<script lang="ts">
    import "./editor.css";

    import { ALL_FEATURES, getExtensions, normalizeContent } from ".";
    import { generateHTML } from "@tiptap/html";
    import { getPrompter } from "$lib/Prompter.svelte";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { Editor } from "@tiptap/core";
    import { getToaster } from "$lib/Toaster.svelte";

    let { content = $bindable(null) }: Props = $props();
    type Props = {
        content?: string | null;
    };
    const toaster = getToaster();
    const prompter = getPrompter();

    const extensions = getExtensions(ALL_FEATURES, prompter);
    const jsonContent = $derived(normalizeContent(content, extensions));
    let htmlContent = $derived(
        jsonContent ? generateHTML(jsonContent, extensions) : null
    );

    let element: HTMLDivElement | undefined = $state();
    let editor: Editor | null = $state(null);
    onMount(() => {
        editor = new Editor({
            element,
            extensions,
            content: normalizeContent(content, extensions),
            editable: false,
            onUpdate: props => {
                if (editor?.isEmpty) {
                    content = "";
                    return;
                }
                content = JSON.stringify(props.editor.getJSON());
            },
            enableContentCheck: true,
            onContentError: () => {
                toaster.add("Не удалось загрузить документ", "error");
            }
        });
        return () => {
            editor?.destroy();
        };
    });
</script>

{#if browser}
    <article class="rich-content flex-1 flex flex-col overflow-auto">
        <div class="contents" bind:this={element}></div>
    </article>
{:else}
    <article
        class="relative flex-1 flex flex-col size-full overflow-hidden"
        spellcheck="false"
    >
        <div class="rich-content flex-1 flex flex-col overflow-auto">
            {@html htmlContent}
        </div>
    </article>
{/if}

<style>
    :global(.ProseMirror:focus) {
        outline: none;
    }
</style>
