import Code from "@tiptap/extension-code";
import Strike from "@tiptap/extension-strike";
import { Table, TableCell, TableHeader } from "@tiptap/extension-table";
import type { DOMOutputSpec } from "@tiptap/pm/model";

/**
 * Patch for default table that ensures "tableWrapper" exists in the HTML form.
 *
 * @see https://github.com/ueberdosis/tiptap/issues/4872
 */
export const WrappedTable = Table.extend({
    renderHTML({ node, HTMLAttributes }) {
        const originalRender = this.parent?.({ node, HTMLAttributes });
        const wrapper: DOMOutputSpec = [
            "div",
            { class: "tableWrapper" },
            originalRender
        ];
        return wrapper;
    }
});

/** Patch for striked text extension to use Telegram-like shortcut. */
export const PatchedStrike = Strike.extend({
    addKeyboardShortcuts() {
        return {
            "Mod-Shift-x": () => this.editor.commands.toggleStrike()
        };
    }
});

/** Patch for inline code extension to use Telegram-like shortcut. */
export const PatchedCode = Code.extend({
    addKeyboardShortcuts() {
        return {
            "Mod-Shift-m": () => this.editor.commands.toggleCode()
        };
    }
});

export const PatchedTableHeader = TableHeader.extend({
    content: "paragraph"
});

export const PatchedTableCell = TableCell.extend({
    content: "paragraph+"
});
