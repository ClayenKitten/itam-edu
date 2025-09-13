import type { Editor } from "@tiptap/core";
import { Link as OriginalLink } from "@tiptap/extension-link";

export const Link = OriginalLink.extend({
    addKeyboardShortcuts() {
        return {
            "Mod-k": () => setLink(this.editor)
        };
    }
});

export function setLink(editor: Editor) {
    const attributes = editor.getAttributes("link");

    let defaultValue = "";
    if ("href" in attributes) {
        defaultValue = attributes.href;
    }

    if (!editor.can().setLink({ href: "" })) return;
    let href = prompt("Введите адрес ссылки", defaultValue);
    if (!href) {
        editor.commands.unsetLink();
        return;
    }
    if (
        !href.startsWith("https://") &&
        !href.startsWith("http://") &&
        !href.startsWith("/")
    ) {
        href = "https://" + href.trim();
    }

    editor.commands.setLink({
        href
    });
}
