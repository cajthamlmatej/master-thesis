import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockConstructor, BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";

export class ImagePlayerBlock extends PlayerBlock {
    private imageUrl: string;

    private imageElement!: HTMLImageElement;

    constructor(base: BlockConstructorWithoutType, imageUrl: string) {
        super({
            ...base,
            type: "image"
        });
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
