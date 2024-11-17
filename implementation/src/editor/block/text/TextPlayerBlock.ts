import {PlayerBlock} from "@/editor/block/PlayerBlock";

export class TextPlayerBlock extends PlayerBlock {
    private content: string;
    private fontSize: number;

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
