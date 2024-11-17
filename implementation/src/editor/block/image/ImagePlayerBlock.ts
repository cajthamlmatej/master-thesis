import {PlayerBlock} from "@/editor/block/PlayerBlock";

export class ImagePlayerBlock extends PlayerBlock {
    private imageUrl: string;

    private imageElement!: HTMLImageElement;

    constructor(id: string, position: { x: number, y: number }, size: { width: number, height: number }, rotation: number = 0, zIndex: number = 0, imageUrl: string) {
        super(id, "image", position, size, rotation, zIndex);
        this.imageUrl = imageUrl;
    }

    render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-image");

        const content = document.createElement("img");

        content.src = this.imageUrl;

        element.appendChild(content);

        this.imageElement = content;

        return element;
    }

    override synchronize() {
        super.synchronize();

        if (!this.imageElement) {
            return;
        }

        if (this.imageElement.src !== this.imageUrl)
            this.imageElement.src = this.imageUrl;
    }

}
