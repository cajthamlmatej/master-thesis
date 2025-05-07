import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {Property} from "@/editor/property/Property";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {BlockInteractiveProperty} from "@/editor/interactivity/BlockInteractivity";
import {BlockEventListener} from "@/editor/block/events/BlockListener";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {IncludeLinesProperty} from "@/editor/block/base/code/property/IncludeLinesProperty";
import {LanguageProperty} from "@/editor/block/base/code/property/LanguageProperty";

export class CodeEditorBlock extends EditorBlock {
    @BlockSerialize("content")
    private content: string;
    @BlockSerialize("lines")
    private lines: boolean;
    @BlockSerialize("language")
    private language: string;

    private editable: boolean = true;
    private removed = false;

    constructor(base: BlockConstructorWithoutType, content: string, lines: boolean = true, language: string = "auto") {
        super({
            ...base,
            type: "code",
        });
        this.content = content;
        this.lines = lines;
        this.language = language;
    }

    public setLanguage(value: string) {
        this.language = value;
        this.changeEditable(this.editable, true);
    }
    public getLanguage(): string {
        return this.language;
    }

    public setLines(value: boolean) {
        this.lines = value;
        this.changeEditable(this.editable, true);
    }

    public getLines(): boolean {
        return this.lines;
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-code");

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

    override clone(): EditorBlock {
        return new CodeEditorBlock(this.getCloneBase(), this.content);
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

    getProperties(): Property<this>[] {
        return [
            ...super.getProperties(),
            new IncludeLinesProperty(),
            new LanguageProperty()
        ]
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



    private async changeEditable(value: boolean, force: boolean = false) {
        if(value === this.editable && !force) {
            return;
        }

        this.editable = value;

        const content = (this.element.querySelector(".block-content")! as HTMLElement);

        if (!value) {
            try {
                this.element.classList.remove("block--type-code--editable");
                content.setAttribute("contenteditable", "false");
                content.removeAttribute("data-processed");

                content.innerHTML = "";

                const iframe = document.createElement("iframe");

                const domain = window.location.origin;
                const htmlContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <link rel="stylesheet" href="https://unpkg.com/@highlightjs/cdn-assets@11.4.0/styles/base16/atelier-seaside-light.min.css">
                        <script
                            src="${domain}/highlight/highlight.min.js"
                        ></script>
                        <style>
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                                font-family: "Fira Code", monospace;
                            }
                            html, body {
                                width: 100%;
                                min-height: 100%;
                                padding: 2em;

                                display: flex;
                                align-items: center;
                                justify-content: center;
                            }
                            div.lines {
                                display: grid;
                                grid-template-columns: ${this.lines? "max-content" : ""} 1fr;
                                gap: 1rem;
                                background:#f1f1f1;
                                padding: 0.5rem;
                                border-radius: 0.5rem;
                                line-height: 1;
                            }
                            div.lines .line-number {
                                text-align: right;
                                color: #525252;
                            }
                            div.lines .line-content {
                                color:#5e6e5e;
                                white-space: pre-wrap;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="lines">${this.content.replace(/\r/g, "")}</div>

                        <script>
                            document.addEventListener("DOMContentLoaded", () => {
                                let lines = "";

                                if(${this.language && this.language === "auto"}) {
                                    lines = hljs.highlightAuto(document.querySelector(".lines").innerHTML).value.split("\\n");
                                } else {
                                    lines = hljs.highlight(document.querySelector(".lines").innerHTML, {
                                        language: "${this.language}",
                                    }).value.split("\\n");
                                }

                                let newOutput = "";

                                let lineCount = 0;
                                for(let line of lines) {
                                    const lineNumber = ${this.lines} ? \`<span class="line-number">\${++lineCount}</span>\` : "";
                                    newOutput += \`\${lineNumber}<span class="line-content">\${line}</span>\`;
                                }

                                const content = document.querySelector(".lines");
                                content.innerHTML = newOutput;
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
            this.element.classList.add("block--type-code--editable");
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
