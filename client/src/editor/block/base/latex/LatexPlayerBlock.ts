import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {BlockInteractiveProperty} from "@/editor/interactivity/BlockInteractivity";

export class LatexPlayerBlock extends PlayerBlock {
    @BlockSerialize("content")
    private content: string;

    private baseContent: string = "";

    constructor(base: BlockConstructorWithoutType, content: string) {
        super({
            ...base,
            type: "latex",
        });
        this.content = content;
        this.baseContent = content;
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

                                      const scaleX = (wrapper.clientWidth-40) / katex.scrollWidth;
                                      const scaleY = (wrapper.clientHeight-40) / katex.scrollHeight;
                                      const scale = Math.min(scaleX, scaleY);

                                      katex.style.transform = \`scale(\$\{Math.max(Math.floor(scale*100)/100, 0.01)\})\`;
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
    }
}
