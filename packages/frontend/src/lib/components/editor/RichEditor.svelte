<script lang="ts">
    import "./editor.css";

    import { onMount } from "svelte";
    import { Editor, type Extensions } from "@tiptap/core";
    import { CharacterCount, Placeholder, Selection } from "@tiptap/extensions";
    import { formatNounAfterNum } from "$lib/format";
    import Toolbar from "./Toolbar.svelte";
    import {
        ALL_FEATURES,
        getExtensions,
        normalizeContent,
        type Features
    } from ".";
    import { getToaster } from "$lib/Toaster.svelte";

    let {
        content = $bindable(null),
        features = ALL_FEATURES,
        placeholder,
        readonly = false,
        characterLimit
    }: Props = $props();
    type Props = {
        content?: string | null;
        features?: Features;
        placeholder?: string;
        readonly?: boolean;
        characterLimit?: number;
    };
    const toaster = getToaster();

    let editorElement: HTMLDivElement;
    let element: HTMLDivElement;
    let editor: Editor | null = $state(null);

    let isFullscreen = $state(false);

    const extensions: Extensions = [
        ...getExtensions(features),
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
            content: normalizeContent(content, extensions),
            editable: !readonly,
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
            },
            onTransaction: props => {
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
        "@container/editor",
        "flex-1 self-stretch",
        "relative flex flex-col",
        "bg-surface",
        "border-2 border-primary-border focus-within:border-primary rounded-sm",
        "transition-colors duration-100"
    ]}
    spellcheck="false"
    bind:this={editorElement}
    onfullscreenchange={() => {
        isFullscreen = document.fullscreenElement !== null;
    }}
>
    <header
        class={[
            "min-h-15 px-3 py-2.5 flex flex-wrap justify-start items-center gap-2",
            "bg-surface-tint text-lg-regular text-on-surface-muted",
            "border-b border-primary-border rounded-t-sm"
        ]}
    >
        <Toolbar
            {editor}
            {features}
            {readonly}
            {isFullscreen}
            onFullscreen={() => {
                editorElement.requestFullscreen();
            }}
        />
    </header>
    <div class="flex-1 flex flex-col overflow-auto">
        <div class="contents rich-editor" bind:this={element}></div>
    </div>
    <footer
        class={[
            "self-stretch h-8 flex justify-end items-center px-3",
            "bg-surface-tint",
            "text-md-medium text-on-surface-muted",
            "border-t border-primary-border rounded-b-sm"
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
