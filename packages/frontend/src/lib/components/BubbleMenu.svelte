<script lang="ts">
    import { Editor } from "@tiptap/core";

    interface Props {
        editor: Editor | undefined;
        element?: HTMLElement;
    }

    let { editor, element = $bindable() }: Props = $props();

    let isBold = $state(false);
    let isItalic = $state(false);
    let isStrike = $state(false);
    let isCode = $state(false);
    let isH1 = $state(false);
    let isH2 = $state(false);
    let isH3 = $state(false);
    let isH4 = $state(false);
    let isCodeBlock = $state(false);

    $effect(() => {
        const update = () => {
            if (!editor) return;
            isBold = editor.isActive("bold");
            isItalic = editor.isActive("italic");
            isStrike = editor.isActive("strike");
            isCode = editor.isActive("code");
            isH1 = editor.isActive("heading", { level: 1 });
            isH2 = editor.isActive("heading", { level: 2 });
            isH3 = editor.isActive("heading", { level: 3 });
            isH4 = editor.isActive("heading", { level: 4 });
            isCodeBlock = editor.isActive("codeBlock");
        };

        editor?.on("selectionUpdate", update);
        editor?.on("transaction", update);

        return () => {
            editor?.off("selectionUpdate", update);
            editor?.off("transaction", update);
        };
    });
</script>

<div
    class="z-10 flex gap-1 p-1 w-min text-on-primary bg-primary rounded-2xs shadow"
    bind:this={element}
>
    <button
        onclick={() => editor?.chain().focus().toggleBold().run()}
        class={[
            "p-1 hover:text-primary hover:bg-on-primary rounded-[6px]",
            isBold ? "is-active" : ""
        ]}
        aria-label="Жирный"
        title="Ctrl + B"
    >
        <i class="text-[20px] flex justify-center items-center ph ph-text-b"
        ></i>
    </button>
    <button
        onclick={() => editor?.chain().focus().toggleItalic().run()}
        class={[
            "p-1 hover:text-primary hover:bg-on-primary rounded-[6px]",
            isItalic ? "is-active" : ""
        ]}
        aria-label="Курсив"
        title="Ctrl + I"
    >
        <i
            class="text-[20px] flex justify-center items-center ph ph-text-italic"
        ></i>
    </button>
    <button
        onclick={() => editor?.chain().focus().toggleStrike().run()}
        class={[
            "p-1 hover:text-primary hover:bg-on-primary rounded-[6px]",
            isStrike ? "is-active" : ""
        ]}
        aria-label="Перечеркнутый"
        title="Ctrl + Shift + S"
    >
        <i
            class="text-[20px] flex justify-center items-center ph ph-text-strikethrough"
        ></i>
    </button>
    <button
        onclick={() => editor?.chain().focus().toggleCode().run()}
        class={[
            "p-1 hover:text-primary hover:bg-on-primary rounded-[6px]",
            isCode ? "is-active" : ""
        ]}
        aria-label="Код"
        title="Ctrl + E"
    >
        <i class="text-[20px] flex justify-center items-center ph ph-code"></i>
    </button>
    <div class="h-4 w-[1px] my-auto mx-1 bg-on-primary opacity-50"></div>
    <button
        onclick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        class={[
            "p-1 hover:text-primary hover:bg-on-primary rounded-[6px]",
            isH1 ? "is-active" : ""
        ]}
        aria-label="Заголовок 1"
        title="Ctrl + Alt + 1"
    >
        <i class="text-[20px] flex justify-center items-center ph ph-text-h-one"
        ></i>
    </button>
    <button
        onclick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        class={[
            "p-1 hover:text-primary hover:bg-on-primary rounded-[6px]",
            isH2 ? "is-active" : ""
        ]}
        aria-label="Заголовок 2"
        title="Ctrl + Alt + 2"
    >
        <i class="text-[20px] flex justify-center items-center ph ph-text-h-two"
        ></i>
    </button>
    <button
        onclick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        class={[
            "p-1 hover:text-primary hover:bg-on-primary rounded-[6px]",
            isH3 ? "is-active" : ""
        ]}
        aria-label="Заголовок 3"
        title="Ctrl + Alt + 3"
    >
        <i
            class="text-[20px] flex justify-center items-center ph ph-text-h-three"
        ></i>
    </button>
    <button
        onclick={() =>
            editor?.chain().focus().toggleHeading({ level: 4 }).run()}
        class={[
            "p-1 hover:text-primary hover:bg-on-primary rounded-[6px]",
            isH4 ? "is-active" : ""
        ]}
        aria-label="Заголовок 4"
        title="Ctrl + Alt + 4"
    >
        <i
            class="text-[20px] flex justify-center items-center ph ph-text-h-four"
        ></i>
    </button>
    <button
        onclick={() => editor?.chain().focus().toggleCodeBlock().run()}
        class={[
            "p-1 hover:text-primary hover:bg-on-primary rounded-[6px]",
            isCodeBlock ? "is-active" : ""
        ]}
        aria-label="Блок кода"
        title="Ctrl + Alt + C"
    >
        <i class="text-[20px] flex justify-center items-center ph ph-code-block"
        ></i>
    </button>
</div>
