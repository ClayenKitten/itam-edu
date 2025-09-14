<script lang="ts">
    import "./editor.css";

    import { onMount } from "svelte";
    import { Editor, type Extensions } from "@tiptap/core";
    import {
        CharacterCount,
        Placeholder,
        Selection,
        UndoRedo
    } from "@tiptap/extensions";
    import { formatNounAfterNum } from "$lib/format";

    import Document from "@tiptap/extension-document";
    import Text from "@tiptap/extension-text";

    let {
        content = $bindable(null),
        placeholder,
        readonly = false,
        characterLimit
    }: Props = $props();
    type Props = {
        content?: string | null;
        placeholder?: string;
        readonly?: boolean;
        characterLimit?: number;
    };

    let element: HTMLDivElement;
    let editor: Editor | null = $state(null);

    const extensions: Extensions = [
        Document.extend({
            content: "inline*"
        }),
        Text,
        UndoRedo,
        CharacterCount.configure({
            limit: characterLimit
        }),
        Selection,
        Placeholder.configure({
            placeholder
        })
    ];

    let characters = $state(0);
    let words = $state(0);
    const characterCountTooltip = $derived(
        `${characters} ${formatNounAfterNum(characters, ["символ", "символа", "символов"])}` +
            (characterLimit ? ` из ${characterLimit}` : "") +
            `, ${words} ${formatNounAfterNum(words, ["слово", "слова", "слов"])}`
    );

    onMount(() => {
        editor = new Editor({
            element,
            extensions,
            content,
            editable: !readonly,
            onUpdate: props => {
                if (editor?.isEmpty) {
                    content = "";
                    return;
                }
                content = props.editor.getText();
            },
            onTransaction: () => {
                characters = editor?.storage.characterCount.characters() ?? 0;
                words = editor?.storage.characterCount.words() ?? 0;
            }
        });
        return () => {
            editor?.destroy();
        };
    });
</script>

<div
    class={[
        "flex-1 self-stretch size-full",
        "relative flex flex-col overflow-clip",
        "border-2 border-primary-border focus-within:border-primary rounded-sm",
        "transition-colors duration-100"
    ]}
    spellcheck="false"
>
    <div class="flex-1 flex flex-col overflow-auto">
        <div class="contents rich-editor" bind:this={element}></div>
    </div>
    <footer
        class={[
            "self-end h-8 flex justify-end items-center px-3",
            "bg-surface-tint text-md-medium text-on-surface-muted",
            "border-t border-l border-primary-border rounded-br-sm rounded-tl-xs"
        ]}
    >
        <span class="cursor-help" title={characterCountTooltip}>
            {characters}
            {#if characterLimit}/ {characterLimit}{/if}
        </span>
    </footer>
</div>

<style>
    :global(.ProseMirror:focus) {
        outline: none;
    }
</style>
