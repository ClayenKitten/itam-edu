<script lang="ts">
    import { dismissable } from "$lib/attachments/dismissable.svelte";
    import type { Editor, EditorEvents } from "@tiptap/core";
    import type { Features } from ".";
    import { browser } from "$app/environment";
    import { setLink } from "./extensions/link";

    let {
        editor,
        features,
        readonly = false,
        isFullscreen = false,
        onFullscreen
    }: Props = $props();
    type Props = {
        editor: Editor | null;
        features: Features;
        readonly?: boolean;
        isFullscreen?: boolean;
        onFullscreen?: () => void;
    };

    let lastUpdate: Date = $state(new Date());

    let textFormat = $state<TextFormat | null>(null);
    type TextFormat =
        | "paragraph"
        | "h1"
        | "h2"
        | "h3"
        | "h4"
        | "numbered-list"
        | "bullet-list"
        | "task-list";

    let isBold = $state(false);
    let isItalic = $state(false);
    let isUnderline = $state(false);
    let isStrike = $state(false);
    let isCode = $state(false);
    let isLink = $state(false);

    let isTable = $state(false);
    let isCodeBlock = $state(false);

    const getTextFormat = (): TextFormat | null => {
        if (!editor) return null;
        // Headers
        if (editor.isActive("heading", { level: 1 })) {
            return "h1";
        }
        if (editor.isActive("heading", { level: 2 })) {
            return "h2";
        }
        if (editor.isActive("heading", { level: 3 })) {
            return "h3";
        }
        if (editor.isActive("heading", { level: 4 })) {
            return "h4";
        }
        // Lists
        if (editor.isActive("orderedList")) {
            return "numbered-list";
        }
        if (editor.isActive("bulletList")) {
            return "bullet-list";
        }
        if (editor.isActive("taskList")) {
            return "task-list";
        }
        // Other
        if (editor.isActive("paragraph")) {
            return "paragraph";
        }
        return null;
    };

    $effect(() => {
        const onTransaction = ({ editor }: EditorEvents["transaction"]) => {
            isBold = editor.isActive("bold");
            isItalic = editor.isActive("italic");
            isUnderline = editor.isActive("underline");
            isStrike = editor.isActive("strike");
            isCode = editor.isActive("code");
            isLink = editor.isActive("link");

            textFormat = getTextFormat();

            isCodeBlock = editor.isActive("codeBlock");
            isTable = editor.isActive("table");

            // Don't update on blur
            if (editor.isFocused) {
                lastUpdate = new Date();
            }
        };

        editor?.on("transaction", onTransaction);
        return () => {
            editor?.off("transaction", onTransaction);
        };
    });
</script>

{#key lastUpdate}
    {#if features.formating}
        <menu
            class={[
                "h-10 flex rounded-2xs",
                "border border-surface-border",
                "hover:border-primary-border focus-within:border-primary-border",
                "transition-colors duration-100"
            ]}
        >
            {@render toggle({
                onclick: () => editor?.chain().focus().toggleBold().run(),
                isActive: isBold,
                disabled: !editor?.can().toggleBold(),
                title: "Жирный [Ctrl + B]",
                icon: "text-b"
            })}
            {@render toggle({
                onclick: () => editor?.chain().focus().toggleItalic().run(),
                isActive: isItalic,
                disabled: !editor?.can().toggleItalic(),
                title: "Курсив [Ctrl + I]",
                icon: "text-italic"
            })}
            {@render toggle({
                onclick: () => editor?.chain().focus().toggleUnderline().run(),
                isActive: isUnderline,
                disabled: !editor?.can().toggleUnderline(),
                title: "Подчёркнутый [Ctrl + U]",
                icon: "text-underline"
            })}
            {@render toggle({
                onclick: () => editor?.chain().focus().toggleStrike().run(),
                isActive: isStrike,
                disabled: !editor?.can().toggleStrike(),
                title: "Зачёркнутый [Ctrl + Shift + X]",
                icon: "text-strikethrough"
            })}
            {@render toggle({
                onclick: () => editor?.chain().focus().toggleCode().run(),
                isActive: isCode,
                disabled: !editor?.can().toggleCode(),
                title: "Моноширинный [Ctrl + Shift + M]",
                icon: "code"
            })}
        </menu>
    {/if}

    {#if features.links || features.files || features.tables}
        <menu
            class={[
                "h-10 flex rounded-2xs",
                "border border-surface-border",
                "hover:border-primary-border focus-within:border-primary-border",
                "transition-colors duration-100"
            ]}
        >
            {#if features.links}
                {@render toggle({
                    onclick: () => editor && setLink(editor),
                    isActive: isLink,
                    title: "Ссылка [Ctrl + K]",
                    icon: "link"
                })}
            {/if}
            {#if features.codeBlocks}
                {@render toggle({
                    onclick: () =>
                        editor?.chain().focus().toggleCodeBlock().run(),
                    isActive: isCodeBlock,
                    title: "Блок кода [Ctrl + Alt + C]",
                    icon: "code-block"
                })}
            {/if}
            {#if features.files || features.tables}
                <details
                    class={[
                        "group relative",
                        "aspect-square shrink-0 outline-0",
                        "bg-surface text-on-surface",
                        "first:rounded-l-2xs last:rounded-r-2xs",
                        "transition-colors duration-100",
                        "open:text-on-primary open:bg-primary",
                        "not-open:hover:text-primary not-open:hover:bg-on-primary",
                        "not-open:focus:text-primary not-open:focus:bg-on-primary"
                    ]}
                    {@attach dismissable<HTMLDetailsElement>(
                        function () {
                            this.open = false;
                        },
                        { dismissOnClickWithin: true }
                    )}
                >
                    <summary
                        class={[
                            "aspect-square cursor-pointer",
                            "flex justify-center items-center",
                            "list-none outline-0",
                            "transition-colors duration-100"
                        ]}
                    >
                        <i class={`ph ph-plus text-[21px] flex `}></i>
                    </summary>
                    <div
                        class={[
                            "z-10 absolute top-11 flex flex-col w-max rounded-2xs overflow-hidden",
                            "bg-surface text-on-surface border border-surface-border",
                            "hover:border-primary-border focus-within:border-primary-border",
                            "transition-colors duration-100 shadow"
                        ]}
                    >
                        {#if features.files}
                            {@render button({
                                onclick: () => {
                                    // TODO
                                    alert("Sorry, not implemented yet!");
                                },
                                icon: "image",
                                text: "Изображение"
                            })}
                            {@render button({
                                onclick: () => {
                                    // TODO
                                    alert("Sorry, not implemented yet!");
                                },
                                icon: "video",
                                text: "Видео"
                            })}
                            {@render button({
                                onclick: () => {
                                    // TODO
                                    alert("Sorry, not implemented yet!");
                                },
                                icon: "paperclip",
                                text: "Файл"
                            })}
                        {/if}
                        {#if features.tables}
                            {@render button({
                                onclick: () =>
                                    editor?.chain().focus().insertTable().run(),
                                icon: "table",
                                text: "Таблица"
                            })}
                        {/if}
                    </div>
                </details>
            {/if}
        </menu>
    {/if}

    <div class="flex-1 basis-0"></div>

    {#if features.headers}
        <menu
            class={[
                "h-10 flex rounded-2xs",
                "border border-surface-border",
                "hover:border-primary-border focus-within:border-primary-border",
                "transition-colors duration-100"
            ]}
        >
            {@render toggle({
                onclick: () =>
                    editor?.chain().focus().toggleHeading({ level: 1 }).run(),
                isActive: textFormat === "h1",
                title: "Заголовок 1 [Ctrl + Alt + 1]",
                icon: "text-h-one"
            })}
            {@render toggle({
                onclick: () =>
                    editor?.chain().focus().toggleHeading({ level: 2 }).run(),
                isActive: textFormat === "h2",
                title: "Заголовок 2 [Ctrl + Alt + 2]",
                icon: "text-h-two"
            })}
            {@render toggle({
                onclick: () =>
                    editor?.chain().focus().toggleHeading({ level: 3 }).run(),
                isActive: textFormat === "h3",
                title: "Заголовок 3 [Ctrl + Alt + 3]",
                icon: "text-h-three"
            })}
            {@render toggle({
                onclick: () =>
                    editor?.chain().focus().toggleHeading({ level: 4 }).run(),
                isActive: textFormat === "h4",
                title: "Заголовок 4 [Ctrl + Alt + 4]",
                icon: "text-h-four"
            })}
        </menu>
    {/if}

    {#if features.lists}
        <menu
            class={[
                "h-10 flex rounded-2xs",
                "border border-surface-border",
                "hover:border-primary-border focus-within:border-primary-border",
                "transition-colors duration-100"
            ]}
        >
            {@render toggle({
                onclick: () => editor?.chain().focus().toggleBulletList().run(),
                isActive: textFormat === "bullet-list",
                title: "Маркированный список [Ctrl + Shift + 7]",
                icon: "list-dashes"
            })}
            {@render toggle({
                onclick: () =>
                    editor?.chain().focus().toggleOrderedList().run(),
                isActive: textFormat === "numbered-list",
                title: "Нумерованный список [Ctrl + Shift + 8]",
                icon: "list-numbers"
            })}
        </menu>
    {/if}

    {#if features.fullscreen && browser && document.fullscreenEnabled}
        <menu
            class={[
                "h-10 flex rounded-2xs",
                "border border-surface-border",
                "hover:border-primary-border focus-within:border-primary-border",
                "transition-colors duration-100"
            ]}
        >
            {@render toggle({
                onclick: () => {
                    if (isFullscreen) {
                        document.exitFullscreen();
                    } else {
                        onFullscreen?.();
                    }
                },
                isActive: !!isFullscreen,
                title: isFullscreen
                    ? "Свернуть редактор"
                    : "Открыть редактор на весь экран",
                icon: isFullscreen ? "arrows-in" : "arrows-out"
            })}
        </menu>
    {/if}
{/key}

{#snippet toggle(params: {
    onclick: () => void;
    isActive: boolean;
    disabled?: boolean;
    title: string;
    icon: string;
})}
    <button
        onclick={params.onclick}
        class={[
            "aspect-square shrink-0 outline-0",
            "first:rounded-l-2xs last:rounded-r-2xs",
            "transition-colors duration-100",
            params.isActive
                ? "text-on-primary bg-primary"
                : [
                      "text-on-surface bg-surface",
                      "disabled:opacity-40 disabled:cursor-not-allowed",
                      "not-disabled:hover:text-primary not-disabled:hover:bg-on-primary",
                      "not-disabled:focus:text-primary not-disabled:focus:bg-on-primary"
                  ]
        ]}
        disabled={params.disabled || readonly}
        aria-label={params.title}
        title={params.title}
    >
        <i
            class={`ph ph-${params.icon} text-[21px] flex justify-center items-center`}
        ></i>
    </button>
{/snippet}

{#snippet button(params: { onclick: () => void; icon: string; text: string })}
    <button
        onclick={params.onclick}
        class={[
            "flex items-center gap-2 h-10 px-3 outline-0",
            "transition-colors duration-100",
            "text-on-surface bg-surface",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "not-disabled:hover:text-primary not-disabled:hover:bg-on-primary",
            "not-disabled:focus:text-primary not-disabled:focus:bg-on-primary"
        ]}
        disabled={readonly}
    >
        <i
            class={`ph ph-${params.icon} text-[21px] flex justify-center items-center`}
        ></i>
        <span>{params.text}</span>
    </button>
{/snippet}
