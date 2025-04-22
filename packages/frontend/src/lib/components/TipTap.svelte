<script lang="ts">
    import "./TipTap.css";

    import { onDestroy, untrack } from "svelte";
    import { Editor } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";
    import { browser } from "$app/environment";
    import BubbleMenu from "@tiptap/extension-bubble-menu";
    import BubbleMenuComponent from "./BubbleMenu.svelte";
    import Link from "@tiptap/extension-link";

    let {
        content = $bindable(null),
        readonly = false
    }: { content?: string | null; readonly?: boolean } = $props();

    let element: HTMLDivElement | undefined = $state();
    let bubblemenu: HTMLElement | undefined = $state();
    let editor: Editor | undefined = $state();

    function createEditor() {
        editor = new Editor({
            element,
            extensions: [
                StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
                BubbleMenu.configure({
                    element: bubblemenu
                }),
                Link.configure({
                    openOnClick: false,
                    defaultProtocol: "https"
                })
            ],
            content,
            onUpdate: props => {
                if (editor?.isEmpty) {
                    content = "";
                    return;
                }
                content = props.editor.getHTML();
            },
            onTransaction: props => {
                // force re-render so `editor.isActive` works as expected
                editor = editor;
            }
        });
    }

    $effect(() => {
        if (!readonly) {
            untrack(() => createEditor());
        }
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
    <BubbleMenuComponent {editor} bind:element={bubblemenu} />
{/if}

<style>
    :global(.ProseMirror:focus) {
        outline: none;
    }
</style>
