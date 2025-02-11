import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {BlockEventListener} from "@/editor/block/events/BlockListener";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {useMediaStore} from "@/stores/media";

const mediaStore = useMediaStore();

export class ImageEditorBlock extends EditorBlock {
    @BlockSerialize("imageUrl")
    private readonly imageUrl?: string;
    @BlockSerialize("mediaId")
    private readonly mediaId?: string;

    private imageElement!: HTMLImageElement;

    constructor(base: BlockConstructorWithoutType, imageUrl?: string, mediaId?: string) {
        super({
            ...base,
            type: "image"
        });
        this.imageUrl = imageUrl;
        this.mediaId = mediaId;
    }

    public getUrl() {
        if(this.mediaId) {
            return mediaStore.linkToMedia(this.mediaId);
        }

        return this.imageUrl ?? "";
    }

    // noinspection DuplicatedCode
    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-image");

        const content = document.createElement("img");

        content.crossOrigin = "anonymous";
        content.setAttribute("crossorigin", "anonymous")
        content.setAttribute("draggable", "false");
        content.src = this.getUrl();

        element.appendChild(content);

        this.imageElement = content;

        return element;
    }

    override synchronize() {
        super.synchronize();

        if (!this.imageElement) {
            return;
        }

        let url = this.getUrl();
        if (this.imageElement.src !== url)
            this.imageElement.src = url;
    }

    override clone(): EditorBlock {
        return new ImageEditorBlock(this.getCloneBase(), this.imageUrl, this.mediaId);
    }

    // @BlockEventListener(BlockEvent.MOUNTED)
    // loadImage() {
    //     const image = new Image();
    //     image.src = this.getUrl();
    //     image.crossOrigin = "anonymous";
    //
    //     image.addEventListener("load", () => {
    //         const ratio = image.width / image.height;
    //
    //         this.size.height = this.size.width / ratio;
    //
    //         this.synchronize();
    //     });
    // }
}
