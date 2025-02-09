import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import mermaid from "mermaid";

export class MermaidPlayerBlock extends PlayerBlock {
    private content: string = "";

    constructor(base: BlockConstructorWithoutType, content: string) {
        super({
            ...base,
            type: "mermaid",
        });
        this.content = content;
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-mermaid");

        const content = document.createElement("pre");

        content.classList.add("block-content");
        element.appendChild(content);

        return element;
    }

    synchronize() {
        super.synchronize();

        this.renderMermaid(this.element.querySelector(".block-content")!);
    }

    private async renderMermaid(content: HTMLElement) {
        content.innerHTML = "";
        const iframe = document.createElement("iframe");

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

        iframe.addEventListener("load", async() => {
            iframe.contentDocument!.head.appendChild(css);

            const {svg} = await mermaid.render('graphDiv', this.content);

            iframe.contentDocument!.body.innerHTML = svg;
            iframe.contentDocument!.close();

            content.removeAttribute("data-processed");
        });


        content.appendChild(iframe);
    }
}
