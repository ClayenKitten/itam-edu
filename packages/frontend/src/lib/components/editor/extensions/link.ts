import type { Prompter } from "$lib/Prompter.svelte";
import { getAttributes, type Editor } from "@tiptap/core";
import { Link as OriginalLink } from "@tiptap/extension-link";
import LinkPrompt from "../LinkPrompt.svelte";

export function createLinkExtension(prompter: Prompter) {
    return OriginalLink.extend({
        addKeyboardShortcuts() {
            return {
                "Mod-k": async () => await setLink(this.editor, prompter)
            };
        }
    });
}

export async function setLink(editor: Editor, prompter: Prompter) {
    const attrs = getAttributes(editor.state, "link");
    const href = "href" in attrs ? getCorrectHref(attrs.href) : "";
    const result = await prompter.show(LinkPrompt, {
        initialUrl: href
    });
    if (!result) return;
    if (result.url) {
        editor
            .chain()
            .focus()
            .setLink({
                href: result.url
            })
            .run();
    } else {
        editor.chain().focus().unsetLink().run();
    }
    if (editor.state.selection.from !== editor.state.selection.to) {
        // If we had some text selected, don't continue link mark
        editor
            .chain()
            .focus()
            .setTextSelection(editor.state.selection.to)
            .unsetMark("link")
            .run();
    }
}

const getCorrectHref = (href: string): string => {
    href = href.trim();
    if (
        !href.startsWith("https://") &&
        !href.startsWith("http://") &&
        !href.startsWith("/")
    ) {
        href = "https://" + href;
    }
    return href;
};
