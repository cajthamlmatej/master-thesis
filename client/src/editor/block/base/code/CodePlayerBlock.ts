import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {BlockInteractiveProperty} from "@/editor/interactivity/BlockInteractivity";

export class CodePlayerBlock extends PlayerBlock {
    @BlockSerialize("content")
    private content: string;
    @BlockSerialize("lines")
    private lines: boolean = true;
    @BlockSerialize("language")
    private language: string = "auto";

    private baseContent: string = "";

    constructor(base: BlockConstructorWithoutType, content: string, lines: boolean = true, language: string = "auto") {
        super({
            ...base,
            type: "code",
        });
        this.content = content;
        this.baseContent = content;
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

    getInteractivityProperties(): BlockInteractiveProperty[] {
        return [
            ...super.getInteractivityProperties(),
            {
                label: "content",
                getBaseValue: () => this.baseContent,
                change: (value: any, relative: boolean) => {
                    this.content = value.toString();

                    this.synchronize();
                    return true;
                }
            }
        ];
    }
    synchronize() {
        super.synchronize();

        this.renderIframe(this.element.querySelector(".block-content")!);
    }

    private async renderIframe(content: HTMLElement) {
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
                                max-height: 80vh;
                                overflow: auto;
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
    }
}
