import Editor from "@/editor/Editor";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {Property} from "@/editor/property/Property";

export class EditorProperty {
    private element!: HTMLElement;
    private editor: Editor;
    private activeProperties: Property[] = [];

    constructor(editor: Editor, element: HTMLElement) {
        this.editor = editor;

        this.element = element;
        this.setup();

        this.editor.getSelector().events.SELECTED_BLOCK_CHANGED.on((blocks: EditorBlock[]) => this.update(blocks));
    }

    public getEditor() {
        return this.editor;
    }

    private setup() {
    }

    private update(blocks: EditorBlock[]) {
        this.element.innerHTML = "";
        if (blocks.length === 0) {
            return;
        }

        const properties = blocks
            .map(block => block.getProperties())
            .flat()
            .reduce((acc: Property[], property) => acc.some(p => p.getID() === property.getID()) ? acc : [...acc, property], []);

        this.activeProperties = properties;

        for (const property of properties) {
            const element = document.createElement("div");
            element.classList.add("property");
            element.classList.add("property--type-" + (typeof property).toLowerCase().replace("property", ""));
            this.element.appendChild(element);

            property.initialize(element, this, blocks);
            property.setup();
        }
    }
}
