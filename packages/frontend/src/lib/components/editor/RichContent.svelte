<script lang="ts">
    import "./editor.css";

    import { ALL_FEATURES, getExtensions, normalizeContent } from ".";
    import { generateHTML } from "@tiptap/html";

    let { content = $bindable(null) }: Props = $props();
    type Props = {
        content?: string | null;
    };

    const extensions = getExtensions(ALL_FEATURES);
    const jsonContent = $derived(normalizeContent(content, extensions));
    let htmlContent = $derived(
        jsonContent ? generateHTML(jsonContent, extensions) : null
    );
</script>

<div
    class="relative flex-1 flex flex-col size-full overflow-hidden"
    spellcheck="false"
>
    <div class="rich-content flex-1 flex flex-col overflow-auto">
        {@html htmlContent}
    </div>
</div>

<style>
    :global(.ProseMirror:focus) {
        outline: none;
    }
</style>
