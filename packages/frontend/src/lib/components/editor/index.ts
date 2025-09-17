import { type AnyExtension, type JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import { generateJSON } from "@tiptap/html";
import { PatchedCode, PatchedStrike, WrappedTable } from "./extensions/patches";
import { all, createLowlight } from "lowlight";
import { CodeBlock } from "./extensions/codeBlock";
import type { Prompter } from "$lib/Prompter.svelte";
import { createLinkExtension } from "./extensions/link";

export const ALL_FEATURES = {
    fullscreen: true,
    formating: true,
    links: true,
    codeBlocks: true,
    headers: true,
    lists: true,
    files: true,
    tables: true
} as const;

export type Feature = keyof typeof ALL_FEATURES;
export type Features = Partial<Record<Feature, boolean>>;

export function getExtensions(
    features: Features,
    prompter: Prompter
): AnyExtension[] {
    const extensions: AnyExtension[] = [
        StarterKit.configure({
            // Formatting
            bold: features.formating ? {} : false,
            italic: features.formating ? {} : false,
            underline: features.formating ? {} : false,
            // Heading
            heading: features.headers ? { levels: [1, 2, 3, 4] } : false,
            // Lists
            listItem: features.lists ? {} : false,
            bulletList: features.lists ? {} : false,
            orderedList: features.lists ? {} : false,
            listKeymap: features.lists ? {} : false,
            // Disabled
            strike: false,
            code: false,
            link: false,
            codeBlock: false,
            blockquote: false,
            horizontalRule: false
        })
    ];
    if (features.formating) {
        extensions.push(PatchedStrike, PatchedCode);
    }
    if (features.links) {
        const ext = createLinkExtension(prompter);
        extensions.push(ext);
    }
    if (features.codeBlocks) {
        const lowlight = createLowlight(all);
        extensions.push(
            CodeBlock.configure({
                lowlight,
                enableTabIndentation: true,
                defaultLanguage: "html",
                HTMLAttributes: {
                    class: "hljs"
                }
            })
        );
    }
    if (features.tables) {
        extensions.push(
            TableKit.configure({
                table: false
            }),
            WrappedTable.configure({
                resizable: true
            })
        );
    }
    return extensions;
}

/** Ensures all content is in TipTap/ProseMirror JSON format. */
export function normalizeContent(
    content: string | JSONContent | null,
    extensions: AnyExtension[]
): JSONContent | null {
    if (content === null) return null;
    if (typeof content === "string") {
        try {
            return JSON.parse(content);
        } catch {
            try {
                // Migration from HTML.
                return generateJSON(content, extensions);
            } catch (e) {
                console.error("Failed to normalize editor data: ", e);
                return generateJSON(
                    "Не удалось загрузить содержимое редактора.",
                    extensions
                );
            }
        }
    }
    return content;
}
