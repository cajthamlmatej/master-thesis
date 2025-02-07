import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {BlockEventListener} from "@/editor/block/events/BlockListener";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import mermaid from "mermaid";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {generateUUID} from "@/utils/Generators";

export class MermaidEditorBlock extends EditorBlock {
    @BlockSerialize("content")
    private content: string = "";

    constructor(base: BlockConstructorWithoutType, content: string) {
        super({
            ...base,
            type: "mermaid",
        });
        this.content = content;
    }

    private editable: boolean = true;
    private removed = false;

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-mermaid");

        const content = document.createElement("pre");

        content.classList.add("block-content");
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
            nonProportionalResizingY: true,
            rotation: true,
            zIndex: true,
            lock: true,
        }
    }


    override canCurrentlyDo(action: "select" | "move" | "resize" | "rotate"): boolean {
        if (this.locked && action !== "select") {
            return false;
        }

        if (action === "move" || action === "resize" || action === "rotate") {
            return !this.editable;
        }

        return true;
    }

    override clone(): EditorBlock {
        return new MermaidEditorBlock(this.getCloneBase(), this.content);
    }

    @BlockEventListener(BlockEvent.SELECTED)
    private onSelected() {
        this.element.addEventListener("keydown", this.onKeyDown.bind(this));
        this.element.addEventListener("input", this.onInput.bind(this));
    }

    private onKeyDown(event: KeyboardEvent) {
        // console.log("keydown", event.key, this.editable);
        if (event.key === "Escape" && this.editable) {
            event.preventDefault();
            event.stopPropagation();
            this.changeEditable(false);

            this.editor.events.BLOCK_CONTENT_CHANGED.emit(this);
        }
    }

    private onInput() {
        this.content = (this.element.querySelector(".block-content")! as HTMLElement).innerText;
        this.editor.events.BLOCK_CONTENT_CHANGED.emit(this);
    }

    private async changeEditable(value: boolean) {
        if (value === this.editable) {
            return;
        }

        this.editable = value;

        const content = (this.element.querySelector(".block-content")! as HTMLElement);

        if (!value) {
            this.element.classList.remove("block--type-mermaid--editable");
            content.setAttribute("contenteditable", "false");
            content.removeAttribute("data-processed");

            content.innerHTML = "";
            const iframe = document.createElement("iframe");

            content.appendChild(iframe);

            const css = document.createElement("style");
            css.innerHTML = `
            body {
                margin: 0;
                padding: 0;
                height: 100%;
                width: 100%;
            }
            svg {
                height: 100%;
                width: 100%;
                flex-grow: 1;
                object-fit: contain;
                max-width: 100% !important;
                overflow: hidden;
            }`;

            iframe.contentDocument!.head.appendChild(css);

            const {svg} = await mermaid.render('graphDiv', this.content);

            iframe.contentDocument!.body.innerHTML = svg;

            iframe.setAttribute("data-id", generateUUID());

            iframe.contentDocument!.close();

            content.removeAttribute("data-processed");
        } else {
            this.element.classList.add("block--type-mermaid--editable");
            content.setAttribute("contenteditable", "true");
            content.removeAttribute("data-processed");
            content.innerText = this.content;
        }
    }

    @BlockEventListener(BlockEvent.MOUNTED)
    private onMounted() {
        this.changeEditable(false);
    }

    @BlockEventListener(BlockEvent.CLICKED)
    private onBlockClicked() {
        this.changeEditable(true);
        this.synchronize();
    }

    @BlockEventListener(BlockEvent.DESELECTED)
    private onDeselected() {
        if (this.removed) {
            // Block was removed, do not do anything.
            // note(Matej): This exist because this deselect call removeBlock, which calls onDeselected again
            return;
        }

        this.changeEditable(false);

        this.element.removeEventListener("keydown", this.onKeyDown.bind(this));
        this.element.removeEventListener("input", this.onInput.bind(this));
        this.editor.events.HISTORY.emit();
    }

    @BlockEventListener(BlockEvent.ROTATION_STARTED)
    @BlockEventListener(BlockEvent.ROTATION_ENDED)
    @BlockEventListener(BlockEvent.MOVEMENT_STARTED)
    private blur() {
        (this.element.querySelector(".block-content")! as HTMLElement).blur();
    }
}
