import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {Property} from "@/editor/property/Property";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {BlockInteractiveProperty} from "@/editor/interactivity/BlockInteractivity";
import {BlockEventListener} from "@/editor/block/events/BlockListener";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import console from "node:console";

export class LatexEditorBlock extends EditorBlock {
    @BlockSerialize("content")
    private content: string = "";

    private editable: boolean = true;
    private removed = false;

    constructor(base: BlockConstructorWithoutType, content: string) {
        super({
            ...base,
            type: "latex",
        });
        this.content = content;
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-latex");

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
        return new LatexEditorBlock(this.getCloneBase(), this.content);
    }

    @BlockEventListener(BlockEvent.SELECTED)
    private onSelected() {
        this.element.addEventListener("keydown", this.onKeyDown.bind(this));
        this.element.addEventListener("input", this.onInput.bind(this));
        this.element.addEventListener("paste", this.onPaste.bind(this));
    }

    private onPaste(event: ClipboardEvent) {
        event.preventDefault();
        event.stopImmediatePropagation();

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
                this.element.classList.remove("block--type-latex--editable");
                content.setAttribute("contenteditable", "false");
                content.removeAttribute("data-processed");

                content.innerHTML = "";

                const iframe = document.createElement("iframe");

                const htmlContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            html, body {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                                width: 100%;
                                height: 100%;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                overflow: hidden;
                            }
                        </style>
                        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.1/dist/katex.min.css"/>
                    </head>
                    <body>
                        ${this.content}

                        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.1/dist/katex.min.js"></script>
                        <script>
                            document.addEventListener("DOMContentLoaded", () => {
                                const content = document.body.innerText;

                                window.katex.render(content, document.body, {
                                    displayMode: true,
                                });

                                function scaleKatexToFit() {
                                      const wrapper = document.querySelector("body");
                                      const katex = wrapper.querySelector('.katex-display');

                                      const scaleX = (wrapper.clientWidth-20) / katex.scrollWidth;
                                      const scaleY = (wrapper.clientHeight-20) / katex.scrollHeight;
                                      const scale = Math.min(scaleX, scaleY);

                                      katex.style.transform = \`scale(\$\{scale\})\`;
                                }
                                scaleKatexToFit();
                                window.addEventListener('load', () => scaleKatexToFit());
                                window.addEventListener('resize', () => scaleKatexToFit());
                            })
                        </script>
                    </body>
                    </html>
                `;

                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);

                iframe.src = url;

                iframe.setAttribute("sandbox", "allow-scripts");

                content.appendChild(iframe);
            } catch (e) {
                console.error(e);
            }
        } else {
            this.element.classList.add("block--type-latex--editable");
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
