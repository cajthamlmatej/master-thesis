import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {useMediaStore} from "@/stores/media";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {BlockInteractiveProperty} from "@/editor/interactivity/BlockInteractivity";

const mediaStore = useMediaStore();

export class ImagePlayerBlock extends PlayerBlock {
    @BlockSerialize("imageUrl")
    private imageUrl?: string;
    @BlockSerialize("mediaId")
    private mediaId?: string;

    private baseImageUrl?: string;

    private imageElement!: HTMLImageElement;

    constructor(base: BlockConstructorWithoutType, imageUrl?: string, mediaId?: string) {
        super({
            ...base,
            type: "image"
        });
        this.imageUrl = imageUrl;
        this.baseImageUrl = imageUrl;
        this.mediaId = mediaId;
    }

    public getUrl() {
        if (this.mediaId) {
            return mediaStore.linkToMedia(this.mediaId);
        }

        return this.imageUrl ?? "";
    }

    render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-image");

        const content = document.createElement("img");

        content.src = this.getUrl();

        element.appendChild(content);

        this.imageElement = content;

        return element;
    }

    getInteractivityProperties(): BlockInteractiveProperty[] {
        return [
            ...super.getInteractivityProperties(),
            {
                label: "imageUrl",
                getBaseValue: () => this.baseImageUrl,
                change: (value: any, relative: boolean) => {
                    this.imageUrl = value.toString();

                    this.synchronize();
                    return true;
                }
            }
        ];
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

}
