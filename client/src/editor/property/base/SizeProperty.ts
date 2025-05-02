import {AggregatorProperty} from "@/editor/property/type/AggregatorProperty";
import {NumberProperty} from "@/editor/property/type/NumberProperty";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {$t} from "@/translation/Translation";

/**
 * Represents a property for managing the size (width and height) of editor blocks.
 * This property aggregates two sub-properties: WidthProperty and HeightProperty.
 */
export class SizeProperty<T extends EditorBlock = EditorBlock> extends AggregatorProperty<T> {

    /**
     * Initializes the SizeProperty with width and height sub-properties.
     */
    constructor() {
        super($t("property.size.label"), [
            /**
             * Represents the width property of an editor block.
             */
            class WidthProperty<T extends EditorBlock = EditorBlock> extends NumberProperty<T> {

                /**
                 * Initializes the WidthProperty with a label and identifier.
                 */
                constructor() {
                    super($t("property.size.width"), "base-size-width");
                }

                /**
                 * Determines if the property is visible.
                 * @returns {boolean} Always true.
                 */
                public override isVisible(): boolean {
                    return true;
                }

                /**
                 * Sets up event listeners for the width property.
                 */
                public override setup(): void {
                    super.setup();

                    this.editorProperty.getEditor().events.BLOCK_SIZE_CHANGED.on((data) => {
                        this.processRecalculateValues();
                    });
                }

                /**
                 * Recalculates the width value based on the blocks' current sizes.
                 * @param change Callback to update the recalculated value.
                 */
                public override recalculateValues(change: (value: number) => void): void {
                    let defaultWidth: string | number = this.blocks[0].size.width;

                    if (!this.blocks.every(block => block.size.width === defaultWidth)) {
                        defaultWidth = "";
                    }

                    change(defaultWidth as number);
                }

                /**
                 * Applies a new width value to the blocks.
                 * @param value The new width value.
                 * @param delta Optional delta for resizing.
                 * @returns {boolean} Whether the resize operation was successful.
                 */
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
            /**
             * Represents the height property of an editor block.
             */
            class HeightProperty<T extends EditorBlock = EditorBlock> extends NumberProperty<T> {

                /**
                 * Initializes the HeightProperty with a label and identifier.
                 */
                constructor() {
                    super($t("property.size.height"), "base-size-height");
                }

                /**
                 * Determines if the property is visible.
                 * @returns {boolean} Always true.
                 */
                public override isVisible(): boolean {
                    return true;
                }

                /**
                 * Sets up event listeners for the height property.
                 */
                public override setup(): void {
                    super.setup();

                    this.editorProperty.getEditor().events.BLOCK_SIZE_CHANGED.on((data) => {
                        this.processRecalculateValues();
                    });
                }

                /**
                 * Recalculates the height value based on the blocks' current sizes.
                 * @param change Callback to update the recalculated value.
                 */
                public override recalculateValues(change: (value: number) => void): void {
                    let defaultHeight: string | number = this.blocks[0].size.height;

                    if (!this.blocks.every(block => block.size.height === defaultHeight)) {
                        defaultHeight = "";
                    }

                    change(defaultHeight as number);
                }

                /**
                 * Applies a new height value to the blocks.
                 * @param value The new height value.
                 * @param delta Optional delta for resizing.
                 * @returns {boolean} Whether the resize operation was successful.
                 */
                public override applyValue(value: number, delta?: {
                    changeX: number,
                    changeY: number,
                    distance: number
                }): boolean {
                    if (delta) {
                        let resizeSuccess = true;
                        for (let block of this.blocks) {
                            const newHeight = block.size.height + delta.changeX;

                            // Check resize constraints
                            if (newHeight < 1) {
                                resizeSuccess = false;
                                break;
                            }

                            block.resize(block.size.width, newHeight, false, true);
                        }

                        return resizeSuccess;
                    }

                    for (let block of this.blocks) {
                        block.resize(block.size.width, value, false, true);
                    }

                    return true;
                }
            }
        ]);
    }

    /**
     * Determines if the size property is visible.
     * @returns {boolean} True if only one block is selected, false otherwise.
     */
    public override isVisible(): boolean {
        return this.blocks.length === 1;
    }

}
