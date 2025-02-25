import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {useMediaStore} from "@/stores/media";
import {Property} from "@/editor/property/Property";
import {ImageUrlProperty} from "@/editor/block/base/image/property/ImageUrlProperty";
import {BlockEventListener} from "@/editor/block/events/BlockListener";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {$t} from "@/translation/Translation";
import {AspectRatioProperty} from "@/editor/block/base/image/property/AspectRatioProperty";

const mediaStore = useMediaStore();

export class ImageEditorBlock extends EditorBlock {
    @BlockSerialize("imageUrl")
    public imageUrl?: string;
    @BlockSerialize("mediaId")
    public mediaId?: string;
    @BlockSerialize("aspectRatio")
    public aspectRatio: boolean;

    private imageElement!: HTMLImageElement;
    private failedToLoad = false;

    constructor(base: BlockConstructorWithoutType, aspectRatio: boolean, imageUrl?: string, mediaId?: string) {
        super({
            ...base,
            type: "image"
        });
        this.aspectRatio = aspectRatio ?? false;
        this.imageUrl = imageUrl;
        this.mediaId = mediaId;
    }
    override editorSupport() {
        return {
            ...super.editorSupport(),
            nonProportionalResizingX: !this.aspectRatio,
            nonProportionalResizingY: !this.aspectRatio
        };
    }

    public getUrl() {
        if(this.mediaId) {
            return mediaStore.linkToMedia(this.mediaId);
        }

        return this.imageUrl ?? "";
    }

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

        if (this.failedToLoad) {
            this.imageElement.src = "";
            this.element.classList.add("block--type-image--failed");
            this.element.style.setProperty("--text", "'" + $t("blocks.image.failed") + "'");
            return;
        } else {
            this.element.classList.remove("block--type-image--failed");
            this.element.style.removeProperty("--text");
        }

        if (!this.imageElement) {
            return;
        }

        let url = this.getUrl();
        if (this.imageElement.src !== url)
            this.imageElement.src = url;
    }

    override clone(): EditorBlock {
        return new ImageEditorBlock(this.getCloneBase(), this.aspectRatio, this.imageUrl, this.mediaId);
    }

    public changeImageUrl(url: string) {
        this.imageUrl = url;
        this.mediaId = undefined;
        this.synchronize();
        this.loadImage();

        this.editor.events.BLOCK_CONTENT_CHANGED.emit(this);
    }

    public changeAspectRatio(aspectRatio: boolean) {
        this.aspectRatio = aspectRatio;
        this.synchronize();

        this.editor.events.BLOCK_CONTENT_CHANGED.emit(this);

        if(this.aspectRatio && this.imageElement) {
            let newHeight = this.size.width / this.imageElement.naturalWidth * this.imageElement.naturalHeight;

            this.resize(this.size.width, newHeight);

            this.editor.events.BLOCK_CONTENT_CHANGED.emit(this);
        }
    }

    public override getProperties(): Property<this>[] {
        return [
            ...super.getProperties(),
            new ImageUrlProperty(),
            new AspectRatioProperty()
        ];
    }

    private loadedImage: HTMLImageElement | undefined = undefined;
    @BlockEventListener(BlockEvent.MOUNTED)
    loadImage() {
        const image = new Image();
        image.src = this.getUrl();
        image.crossOrigin = "anonymous";

        image.addEventListener("load", (e) => {
            this.failedToLoad = false;

            // note(Matej): this is a hack to detect if the image is a 1x1 pixel, because for example
            //   tenor gifs are 1x1 pixels when they are not found
            if(image.height === 1 && image.width === 1) {
                this.failedToLoad = true;
            }

            this.synchronize();
            this.loadedImage = image;
        });
        image.addEventListener("error", () => {
            this.failedToLoad = true;
            this.synchronize();
            this.loadedImage = undefined;
        });
    }
}
