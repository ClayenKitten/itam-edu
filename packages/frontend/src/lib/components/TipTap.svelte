<script lang="ts">
    import "./TipTap.css";

    import { onDestroy } from "svelte";
    import { Editor } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";
    import { browser } from "$app/environment";

    let {
        content = $bindable(null),
        readonly = false
    }: { content?: string | null; readonly?: boolean } = $props();

    let element: HTMLDivElement | undefined = $state();
    let editor: Editor | undefined = $state();

    function createEditor() {
        editor = new Editor({
            element,
            extensions: [
                StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } })
            ],
            content,
            onUpdate: props => {
                content = props.editor.getHTML();
            },
            onTransaction: props => {
                // force re-render so `editor.isActive` works as expected
                editor = editor;
            }
        });
    }

    $effect(() => {
        if (!readonly) createEditor();
    });

    onDestroy(() => {
        if (editor) {
            editor.destroy();
        }
    });
</script>

{#if !browser || readonly}
    <div class="rich-content w-full h-full">
        {@html content}
    </div>
{:else}
    <div class="rich-content w-full h-full" bind:this={element}></div>
{/if}
