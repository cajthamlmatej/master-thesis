import {Block} from "@/editor/block/Block";
import {BlockType} from "@/editor/block/BlockType";

export class TextBlock extends Block {
    private content: string;
    private fontSize: number;

    constructor(id: string, position: { x: number, y: number }, size: { width: number, height: number }, content: string, fontSize: number) {
        super(id, BlockType.TEXT, position, size);
        this.content = content;
        this.fontSize = fontSize;
    }

    render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--text");

        const content = document.createElement("div");

        content.classList.add("block-content");
        // content.setAttribute("contenteditable", "true");

        // TODO: sanitize content?
        content.innerHTML = this.content;

        element.appendChild(content);

        return element;
    }

    override editorSupport() {
        return {
            selection: true,
            movement: true,
            proportionalResizing: true,
            nonProportionalResizingX: true,
            nonProportionalResizingY: false,
            rotation: true
        }
    }

    override getContent() {
        return this.element.querySelector(".block-content")! as HTMLElement;
    }

    override onSelected() {
        super.onSelected();

        const content = this.getContent();
        content.setAttribute("contenteditable", "true");

        content.addEventListener("input", (e) => this.handleInput(e));
    }

    private handleInput(e: Event) {
        const content = this.getContent();
        this.content = content.innerHTML;

        this.matchRenderedHeight();

        // The size could have changed, so we need to update the selector
        this.editor.getSelector().handleSelector();
    }

    override onDeselected() {
        super.onDeselected();

        const content = this.getContent();
        content.removeAttribute("contenteditable");

        content.removeEventListener("input", (e) => this.handleInput(e));
    }

    override synchronize() {
        super.synchronize();

        const content = this.getContent();
        content.style.fontSize = this.fontSize + "px";

        // TODO: could be better?
        // While scaling (the scaling was not completed yet), we don't want to set the width
        if (!content.style.transform.includes("scale")) {
            content.style.width = this.size.width + "px";
        }

        // TODO: sync content?
    }

    override onResizeCompleted(type: "PROPORTIONAL" | "NON_PROPORTIONAL", before: { width: number, height: number }) {
        super.onResizeCompleted(type, before);

        const content = this.getContent();

        if (type === "PROPORTIONAL") {
            this.fontSize = this.fontSize * (this.size.width / before.width);
        }

        // Remove scaling
        content.style.transform = "";

        this.synchronize();
    }

}
