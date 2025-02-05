import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockConstructor, BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";

export class TextPlayerBlock extends PlayerBlock {
    private content: string;
    private fontSize: number;

    constructor(base: BlockConstructorWithoutType, content: string, fontSize: number) {
        super({
            ...base,
            type: "text"
        });
        this.content = content;
        this.fontSize = fontSize;
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-text");

        const content = document.createElement("div");

        content.classList.add("block-content");

        // TODO: sanitize content?
        content.innerHTML = this.content;

        element.appendChild(content);

        return element;
    }

    override synchronize() {
        super.synchronize();

        const content = this.element.querySelector(".block-content") as HTMLElement;
        content.style.fontSize = this.fontSize + "px";
        content.style.width = this.size.width + "px";

        // TODO: sync content?
    }

}
