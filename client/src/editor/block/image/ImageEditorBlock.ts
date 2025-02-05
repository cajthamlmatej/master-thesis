import {EditorBlock} from "@/editor/block/EditorBlock";
import {generateUUID} from "@/utils/Generators";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {BlockEventListener} from "@/editor/block/events/BlockListener";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";

export class ImageEditorBlock extends EditorBlock {
    @BlockSerialize("imageUrl")
    private readonly imageUrl: string;

    private imageElement!: HTMLImageElement;

    constructor(base: BlockConstructorWithoutType, imageUrl: string) {
        super({
            ...base,
            type: "image"
        });
        this.imageUrl = imageUrl;
    }

    // noinspection DuplicatedCode
    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-image");

        const content = document.createElement("img");

        content.crossOrigin = "anonymous";
        content.setAttribute("crossorigin", "anonymous");
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

    override clone(): EditorBlock {
        return new ImageEditorBlock(
            {
                id: generateUUID(),
                position: {x: this.position.x, y: this.position.y},
                size: {width: this.size.width, height: this.size.height},
                rotation: this.rotation,
                zIndex: this.zIndex,
                locked: this.locked,
                group: this.group
            }, this.imageUrl);
    }

    @BlockEventListener(BlockEvent.MOUNTED)
    loadImage() {
        const image = new Image();
        image.src = this.imageUrl;
        image.crossOrigin = "anonymous";

        image.addEventListener("load", () => {
            const ratio = image.width / image.height;

            this.size.height = this.size.width / ratio;

            this.synchronize();
        });
    }
}
