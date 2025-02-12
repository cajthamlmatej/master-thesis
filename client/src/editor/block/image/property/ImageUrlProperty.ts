import {$t} from "@/translation/Translation";
import {TextProperty} from "@/editor/property/type/TextProperty";
import {ImageEditorBlock} from "@/editor/block/image/ImageEditorBlock";

export class ImageUrlProperty<T extends ImageEditorBlock = ImageEditorBlock> extends TextProperty<T> {

    constructor() {
        super($t("blocks.image.property.imageUrl.label"), "imageUrl");
    }

    public override isVisible(): boolean {
        return this.blocks.length <= 1;
    }

    public override setup(): void {
        super.setup();

        this.editorProperty.getEditor().events.BLOCK_CONTENT_CHANGED.on((data) => {
            this.processRecalculateValues();
        });
    }

    public override recalculateValues(change: (value: string) => void): void {
        let defaultUrl: string = this.blocks[0].imageUrl ?? "";

        change(defaultUrl);
    }

    public override applyValue(value: string): boolean {
        for (let block of this.blocks) {
            block.changeImageUrl(value);
        }

        return true;
    }
}
