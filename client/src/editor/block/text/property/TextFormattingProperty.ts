import {Property} from "@/editor/property/Property";
import {TextEditorBlock} from "@/editor/block/text/TextEditorBlock";
import {$t} from "@/translation/Translation";

export class TextFormattingProperty<T extends TextEditorBlock = TextEditorBlock> extends Property<T> {

    isVisible(): boolean {
        return this.blocks.every(b => b.type === "text") && this.blocks.length === 1;
    }

    setup(): void {
        const fonts = ["Arial", "Courier New", "Georgia", "Times New Roman", "Verdana"];

        this.element.innerHTML = `
            <label>${$t("blocks.text.property.formatting.label")}</label>
            <div class="property-content">
                <div class="property-data property-data--row property-data--wrap">
                    <button data-property="bold" name="bold"><i class="mdi mdi-format-bold"></i></button>
                    <button data-property="italic" name="italic"><i class="mdi mdi-format-italic"></i></button>
                    <button data-property="underline" name="underline"><i class="mdi mdi-format-underline"></i></button>
                    <button data-property="strikethrough" name="strikethrough"><i class="mdi mdi-format-strikethrough"></i></button>
                    <button data-property="subscript" name="subscript"><i class="mdi mdi-format-subscript"></i></button>
                    <button data-property="superscript" name="superscript"><i class="mdi mdi-format-superscript"></i></button>
                </div>
                <div class="property-data property-data--row">
                    <input type="color" data-property="color" name="color">
                    <select data-property="font-family" name="font-family">
                        ${fonts.map(font => `<option value="${font}" style="font-family: ${font};">${font}</option>`).join("")}
                    </select>
                    <button data-property="font-size-decrease" name="font-size-decrease"><i class="mdi mdi-format-font-size-decrease"></i></button>
                    <button data-property="font-size-increase" name="font-size-increase"><i class="mdi mdi-format-font-size-increase"></i></button>
                </div>
                <div class="property-data property-data--row property-data--wrap">
                    <button data-property="list-bulleted" name="list-bulleted"><i class="mdi mdi-format-list-bulleted"></i></button>
                    <button data-property="list-numbered" name="list-numbered"><i class="mdi mdi-format-list-numbered"></i></button>
                    <button data-property="align-left" name="align-left"><i class="mdi mdi-format-align-left"></i></button>
                    <button data-property="align-center" name="align-center"><i class="mdi mdi-format-align-center"></i></button>
                    <button data-property="align-right" name="align-right"><i class="mdi mdi-format-align-right"></i></button>
                    <button data-property="align-justify" name="align-justify"><i class="mdi mdi-format-align-justify"></i></button>
                </div>
            </div>
        `;

        const colorInput = this.element.querySelector<HTMLInputElement>("[data-property='color']")!;
        colorInput.addEventListener("input", (event) => {
            const block = this.blocks[0] as TextEditorBlock;
            const editor = block.getTextEditor();

            if(!editor || !block) {
                return;
            }

            if(!block.canBeEdited() || editor.$doc.size === 0) {
                return;
            }


            editor.chain().focus().setColor(colorInput.value ?? "#ff0ffe").run();
            event.preventDefault();
            event.stopImmediatePropagation();
        });

        const fontFamilySelect = this.element.querySelector<HTMLSelectElement>("[data-property='font-family']")!;

        fontFamilySelect.addEventListener("change", (event) => {
            const block = this.blocks[0] as TextEditorBlock;
            const editor = block.getTextEditor();

            if(!editor || !block) {
                return;
            }

            if(!block.canBeEdited() || editor.$doc.size === 0) {
                return;
            }

            editor.chain().focus().setFontFamily(fontFamilySelect.value).run();
            event.preventDefault();
            event.stopImmediatePropagation();
        });


        const block = this.blocks[0] as TextEditorBlock;
        const editor = block.getTextEditor()!;

        const mappings = {
            'bold': () => editor.chain().focus().toggleBold().run(),
            'italic': () => editor.chain().focus().toggleItalic().run(),
            'underline': () => editor.chain().focus().toggleUnderline().run(),
            'strikethrough': () => editor.chain().focus().toggleStrike().run(),
            'subscript': () => editor.chain().focus().toggleSubscript().run(),
            'superscript': () => editor.chain().focus().toggleSuperscript().run(),

            'list-bulleted': () => editor.chain().focus().toggleBulletList().run(),
            'list-numbered': () => editor.chain().focus().toggleOrderedList().run(),
            'align-left': () => editor.chain().focus().setTextAlign("left").run(),
            'align-center': () => editor.chain().focus().setTextAlign("center").run(),
            'align-right': () => editor.chain().focus().setTextAlign("right").run(),
            'align-justify': () => editor.chain().focus().setTextAlign("justify").run(),

            'font-size-decrease': () => {
                let setted = false;
                let selection = editor.view.state.selection

                editor.view.state.doc.nodesBetween(selection.from, selection.to, node => {
                    if(node.marks.length > 0) {
                        let size = Infinity;

                        for(let mark of node.marks) {
                            if(mark.attrs.fontSize) {
                                size = Math.min(size, Number(mark.attrs.fontSize.replace("em", "")));
                            }
                        }

                        if(!isFinite(size)) {
                            size = 1;
                        }

                        if(size <= 0.5) {
                            size = 0.5;
                        }

                        editor.chain().focus().setFontSize((size - 0.25) + "em").run();
                        setted = true;
                    }
                })

                if(!setted) {
                    editor.chain().focus().setFontSize("0.75em").run();
                }

            },
            'font-size-increase': () => {
                let setted = false;
                let selection = editor.view.state.selection

                editor.view.state.doc.nodesBetween(selection.from, selection.to, node => {
                    if(node.marks.length > 0) {
                        let size = Infinity;

                        for(let mark of node.marks) {
                            if(mark.attrs.fontSize) {
                                size = Math.min(size, Number(mark.attrs.fontSize.replace("em", "")));
                            }
                        }

                        if(!isFinite(size)) {
                            size = 1;
                        }

                        editor.chain().focus().setFontSize((size + 0.25) + "em").run();
                        setted = true;
                    }
                })

                if(!setted) {
                    editor.chain().focus().setFontSize("1.25em").run();
                }
            }
        }

        for(let mapping in mappings) {
            const button = this.element.querySelector<HTMLButtonElement>("[data-property='" + mapping + "']")!;

            button.addEventListener("click", (event) => {
                const block = this.blocks[0] as TextEditorBlock;
                const editor = block.getTextEditor();

                if(!editor || !block) {
                    return;
                }

                if(!block.canBeEdited() || editor.$doc.size === 0) {
                    return;
                }

                (mappings as any)[mapping]!(button.value);
                event.preventDefault();
                event.stopImmediatePropagation();
            });
        }
    }

    destroy(): void {
        this.element.innerHTML = "";
    }

}
