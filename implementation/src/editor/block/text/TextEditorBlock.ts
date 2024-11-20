import {EditorBlock} from "@/editor/block/EditorBlock";
import {generateUUID} from "@/utils/Generators";
import {BlockEventListener} from "@/editor/block/events/BlockListener";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";

export class TextEditorBlock extends EditorBlock {
    @BlockSerialize("content")
    private content: string;
    @BlockSerialize("fontSize")
    private fontSize: number;

    private editable: boolean = false;
    private lastClick: number = 0;
    private removed = false;

    constructor(id: string, position: { x: number, y: number }, size: { width: number, height: number }, rotation: number, zIndex: number, content: string, fontSize: number) {
        super(id, "text", position, size, rotation, zIndex);
        this.content = content;
        this.fontSize = fontSize;
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-text");

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
            group: true,
            selection: true,
            movement: true,
            proportionalResizing: true,
            nonProportionalResizingX: true,
            nonProportionalResizingY: false,
            rotation: true,
            zIndex: true,
            lock: true,
        }
    }

    override getContent() {
        return this.element.querySelector(".block-content")! as HTMLElement;
    }

    override canCurrentlyDo(action: "select" | "move" | "resize" | "rotate"): boolean {
        if (this.locked && action !== "select") {
            return false;
        }

        if (action === "move") {
            return !this.editable;
        }
        return true;
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

    override clone(): EditorBlock {
        return new TextEditorBlock(generateUUID(), {...this.position}, {...this.size}, this.rotation, this.zIndex, this.content, this.fontSize);
    }

    @BlockEventListener(BlockEvent.MOUNTED)
    private onMounted() {
        const content = this.getContent();
        content.addEventListener("input", (e) => this.handleInput(e));
        content.addEventListener("mouseup", (e) => this.handleInputClick(e));
    }

    private handleInputClick(e: MouseEvent) {
        if (!this.editable) {
            e.preventDefault();
            return;
        }
    }

    private handleInput(e: Event) {
        if (!this.editable) {
            e.stopImmediatePropagation();
            e.preventDefault();
            return;
        }

        const content = this.getContent();
        this.content = content.innerHTML;

        this.matchRenderedHeight();

        // The size could have changed, so we need to update the selector area
        this.editor.events.BLOCK_CONTENT_CHANGED.emit(this);
    }

    @BlockEventListener(BlockEvent.CLICKED)
    private onClicked(event: MouseEvent) {
        const now = Date.now();
        const diff = now - this.lastClick;

        this.lastClick = now;
        if (diff > 600 || this.locked) {
            return;
        }

        this.getContent().setAttribute("contenteditable", "true");
        this.editable = true;
    }

    @BlockEventListener(BlockEvent.DESELECTED)
    private onDeselected() {
        if (this.removed) {
            // Block was removed, do not do anything.
            // note(Matej): This exist because this deselect call removeBlock, which calls onDeselected again
            return;
        }

        this.getContent().removeAttribute("contenteditable");

        // User was editing and stopped editing, remove block if the content is empty
        if (this.editable) {
            const content = this.content.replace(/<br>/g, "")
                .replace(/\n?\r?/g, "")
                .replace(/&nbsp;/g, "").trim();

            if (content.length === 0) {
                this.editor.removeBlock(this);
                this.removed = true;
            }
        }

        this.editable = false;
    }

    @BlockEventListener(BlockEvent.ROTATION_STARTED)
    @BlockEventListener(BlockEvent.ROTATION_ENDED)
    @BlockEventListener(BlockEvent.MOVEMENT_STARTED)
    private blur() {
        this.getContent().blur();
    }

    @BlockEventListener(BlockEvent.RESIZING_ENDED)
    private onResizeCompleted(type: "PROPORTIONAL" | "NON_PROPORTIONAL", before: { width: number, height: number }) {
        const content = this.getContent();

        if (type === "PROPORTIONAL") {
            this.fontSize = this.fontSize * (this.size.width / before.width);
        }

        // Remove scaling
        content.style.transform = "";

        this.synchronize();
    }
}
