import {AggregatorProperty} from "@/editor/property/type/AggregatorProperty";
import {NumberProperty} from "@/editor/property/type/NumberProperty";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {$t} from "@/translation/Translation";

export class SizeProperty<T extends EditorBlock = EditorBlock> extends AggregatorProperty<T> {

    constructor() {
        super($t("property.size.label"), [
            class WidthProperty<T extends EditorBlock = EditorBlock> extends NumberProperty<T> {

                constructor() {
                    super($t("property.size.width"), "base-size-width");
                }

                public override isVisible(): boolean {
                    return true;
                }

                public override setup(): void {
                    super.setup();

                    this.editorProperty.getEditor().events.BLOCK_SIZE_CHANGED.on((data) => {
                        this.processRecalculateValues();
                    });
                }

                public override recalculateValues(change: (value: number) => void): void {
                    let defaultWidth: string | number = this.blocks[0].size.width;

                    if (!this.blocks.every(block => block.size.width === defaultWidth)) {
                        defaultWidth = "";
                    }

                    change(defaultWidth as number);
                }

                public override applyValue(value: number, delta?: {
                    changeX: number,
                    changeY: number,
                    distance: number
                }): boolean {
                    if (delta) {
                        let resizeSuccess = true;
                        for (let block of this.blocks) {
                            const newWidth = block.size.width + delta.changeX;
                            const newHeight = block.size.height + delta.changeX;

                            // Check resize constraints
                            if (newWidth < 1 || newHeight < 1) {
                                resizeSuccess = false;
                                break;
                            }

                            block.resize(newWidth, block.size.height, false, true);
                        }

                        return resizeSuccess;
                    }

                    for (let block of this.blocks) {
                        block.resize(value, block.size.height, false, true);
                    }

                    return true;
                }
            },
            class HeightProperty<T extends EditorBlock = EditorBlock> extends NumberProperty<T> {

                constructor() {
                    super($t("property.size.height"), "base-size-height");
                }

                public override isVisible(): boolean {
                    return true;
                }

                public override setup(): void {
                    super.setup();

                    this.editorProperty.getEditor().events.BLOCK_SIZE_CHANGED.on((data) => {
                        this.processRecalculateValues();
                    });
                }

                public override recalculateValues(change: (value: number) => void): void {
                    let defaultHeight: string | number = this.blocks[0].size.height;

                    if (!this.blocks.every(block => block.size.height === defaultHeight)) {
                        defaultHeight = "";
                    }

                    change(defaultHeight as number);
                }

                public override applyValue(value: number, delta?: {
                    changeX: number,
                    changeY: number,
                    distance: number
                }): boolean {
                    if (delta) {
                        let resizeSuccess = true;
                        for (let block of this.blocks) {
                            const newWidth = block.size.width + delta.changeX;
                            const newHeight = block.size.height + delta.changeX;

                            // Check resize constraints
                            if (newWidth < 1 || newHeight < 1) {
                                resizeSuccess = false;
                                break;
                            }

                            block.resize(block.size.width, newHeight, false, true);
                        }

                        return resizeSuccess;
                    }

                    for (let block of this.blocks) {
                        block.resize(value, block.size.height, false, true);
                    }

                    return true;
                }
            }
        ]);
    }

    public override isVisible(): boolean {
        return this.blocks.length === 1;
    }

}
