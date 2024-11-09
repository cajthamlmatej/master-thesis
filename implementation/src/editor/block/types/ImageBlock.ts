import {Block} from "@/editor/block/Block";
import {BlockType} from "@/editor/block/BlockType";
import {generateUUID} from "@/utils/Generators";

export class ImageBlock extends Block {
    private imageUrl: string;

    private imageElement!: HTMLImageElement;

    constructor(id: string, position: { x: number, y: number }, size: { width: number, height: number }, rotation: number = 0, zIndex: number = 0, imageUrl: string) {
        super(id, BlockType.IMAGE, position, size, rotation, zIndex);
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

    override onMounted() {
        super.onMounted();

        const image = new Image();
        image.src = this.imageUrl;

        image.addEventListener("load", () => {
            const ratio = image.width / image.height;

            this.size.height = this.size.width / ratio;

            this.synchronize();
        });
    }

    override editorSupport() {
        return {
            group: true,
            selection: true,
            movement: true,
            proportionalResizing: true,
            nonProportionalResizingX: false,
            nonProportionalResizingY: false,
            rotation: true,
            zIndex: true,
            lock: true,
        }
    }

    override getContent() {
        return undefined;
    }

    override synchronize() {
        super.synchronize();

        if (!this.imageElement) {
            return;
        }

        if(this.imageElement.src !== this.imageUrl)
            this.imageElement.src = this.imageUrl;
    }

    override clone(): Block {
        return new ImageBlock(
            generateUUID(),
            {x: this.position.x, y: this.position.y},
            {width: this.size.width, height: this.size.height},
            this.rotation,
            this.zIndex,
            this.imageUrl);
    }
}
