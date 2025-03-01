import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import mermaid from "mermaid";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";

export class IframePlayerBlock extends PlayerBlock {
    @BlockSerialize("content")
    private content: string;

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

    synchronize() {
        super.synchronize();

        this.renderIframe(this.element.querySelector(".block-content")!);
    }

    private async renderIframe(content: HTMLElement) {
        content.innerHTML = "";
        const iframe = document.createElement("iframe");
        iframe.srcdoc = this.content;
        iframe.setAttribute("sandbox", "allow-scripts");

        content.appendChild(iframe);
    }
}
