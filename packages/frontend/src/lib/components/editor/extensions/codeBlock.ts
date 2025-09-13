import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

export const CodeBlock = CodeBlockLowlight.extend({
    addNodeView() {
        return ({ node, getPos, view }) => {
            const currentLanguage: string =
                node.attrs.language ?? this.options.defaultLanguage;

            const header = document.createElement("header");
            header.textContent = currentLanguage;
            header.contentEditable = "false";
            header.addEventListener("click", () => {
                const newLanguage = prompt("Укажите язык программирования");
                if (!newLanguage) return null;
                view.dispatch(
                    view.state.tr.setNodeMarkup(getPos()!, undefined, {
                        language: newLanguage
                    })
                );
            });

            const pre = document.createElement("pre");
            const code = document.createElement("code");
            pre.appendChild(header);
            pre.appendChild(code);

            return {
                dom: pre,
                contentDOM: code
            };
        };
    }
});
