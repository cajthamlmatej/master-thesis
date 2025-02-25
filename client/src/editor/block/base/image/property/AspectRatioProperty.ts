import {$t} from "@/translation/Translation";
import {TextProperty} from "@/editor/property/type/TextProperty";
import {ImageEditorBlock} from "@/editor/block/base/image/ImageEditorBlock";
import {BooleanProperty} from "@/editor/property/type/BooleanProperty";

export class AspectRatioProperty<T extends ImageEditorBlock = ImageEditorBlock> extends BooleanProperty<T> {

    constructor() {
        super($t("blocks.image.property.aspectRatio.label"), "aspectRatio");
    }

    public override isVisible(): boolean {
        return this.blocks.length <= 1;
    }

    public override setup(): void {
        super.setup();
    }

    public override recalculateValues(change: (value: boolean) => void): void {
        let defaultUrl = this.blocks[0].aspectRatio;

        change(defaultUrl);
    }

    public override applyValue(value: boolean): boolean {
        for (let block of this.blocks) {
            block.changeAspectRatio(value);
        }

        return true;
    }
}
