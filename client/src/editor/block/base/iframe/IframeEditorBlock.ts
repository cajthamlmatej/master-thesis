import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {BlockEventListener} from "@/editor/block/events/BlockListener";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {BlockInteractiveProperty} from "@/editor/interactivity/BlockInteractivity";
import * as console from "node:console";

export class IframeEditorBlock extends EditorBlock {
    @BlockSerialize("content")
    private content: string = "";

    private editable: boolean = true;
    private removed = false;

    constructor(base: BlockConstructorWithoutType, content: string) {
        super({
            ...base,
            type: "iframe",
        });
        this.content = content;
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-iframe");

        const content = document.createElement("pre");

        content.classList.add("block-content");
        element.appendChild(content);


        return element;
    }


    getInteractivityProperties(): Omit<BlockInteractiveProperty & {
        relative: boolean;
        animate: boolean
    }, "change" | "reset" | "getBaseValue">[] {
        return [
            ...super.getInteractivityProperties(),
            {
                label: "content",
                relative: false,
                animate: false,
            }
        ];
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
        return new IframeEditorBlock(this.getCloneBase(), this.content);
    }

    @BlockEventListener(BlockEvent.SELECTED)
    private onSelected() {
        this.element.addEventListener("keydown", this.onKeyDown.bind(this));
        this.element.addEventListener("input", this.onInput.bind(this));
        this.element.addEventListener("paste", this.onPaste.bind(this));
    }

    private onPaste(event: ClipboardEvent) {
        event.preventDefault();
        event.stopPropagation();

        const text = event.clipboardData?.getData("text/plain").trim() ?? "";

        // note(Matej): the execCommand is obsolete but this is the only way to insert text (and is deprecated from 2020)
        //     drafts for alternative are currently in progress (2025)
        document.execCommand("insertText", false, text);
    }

    private onKeyDown(event: KeyboardEvent) {
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
            try {
                this.element.classList.remove("block--type-iframe--editable");
                content.setAttribute("contenteditable", "false");
                content.removeAttribute("data-processed");

                content.innerHTML = "";

                const iframe = document.createElement("iframe");
                iframe.srcdoc = this.content;
                iframe.setAttribute("sandbox", "allow-scripts");

                content.appendChild(iframe);
            } catch (e) {
                console.error(e);
            }
        } else {
            this.element.classList.add("block--type-iframe--editable");
            content.setAttribute("contenteditable", "true");
            content.innerText = this.content;
        }
        this.synchronize();
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
        this.element.removeEventListener("paste", this.onPaste.bind(this));
        this.editor.events.HISTORY.emit();
    }

    @BlockEventListener(BlockEvent.ROTATION_STARTED)
    @BlockEventListener(BlockEvent.ROTATION_ENDED)
    @BlockEventListener(BlockEvent.MOVEMENT_STARTED)
    private blur() {
        (this.element.querySelector(".block-content")! as HTMLElement).blur();
    }
}
