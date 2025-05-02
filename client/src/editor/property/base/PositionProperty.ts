import {AggregatorProperty} from "@/editor/property/type/AggregatorProperty";
import {NumberProperty} from "@/editor/property/type/NumberProperty";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {$t} from "@/translation/Translation";

/**
 * Represents a property for managing the position (X and Y coordinates) of editor blocks.
 * This property aggregates two sub-properties: XProperty and YProperty.
 */
export class PositionProperty<T extends EditorBlock = EditorBlock> extends AggregatorProperty<T> {

    /**
     * Initializes the PositionProperty with X and Y sub-properties.
     */
    constructor() {
        super($t("property.position.label"), [
            /**
             * Represents the X-coordinate property of an editor block.
             */
            class XProperty<T extends EditorBlock = EditorBlock> extends NumberProperty<T> {

                /**
                 * Initializes the XProperty with a label and identifier.
                 */
                constructor() {
                    super($t("property.position.x"), "base-position-x");
                }

                /**
                 * Determines if the property is visible.
                 * @returns {boolean} Always true.
                 */
                public override isVisible(): boolean {
                    return true;
                }

                /**
                 * Sets up event listeners for the X-coordinate property.
                 */
                public override setup(): void {
                    super.setup();

                    this.editorProperty.getEditor().events.BLOCK_POSITION_CHANGED.on((data) => {
                        this.processRecalculateValues();
                    });
                }

                /**
                 * Recalculates the X-coordinate value based on the blocks' current positions.
                 * @param change Callback to update the recalculated value.
                 */
                public override recalculateValues(change: (value: number) => void): void {
                    let defaultX: string | number = this.blocks[0].position.x;

                    if (!this.blocks.every(block => block.position.x === defaultX)) {
                        defaultX = "";
                    }

                    change(defaultX as number);
                }

                /**
                 * Applies a new X-coordinate value to the blocks.
                 * @param value The new X-coordinate value.
                 * @param delta Optional delta for position adjustment.
                 * @returns {boolean} Always true.
                 */
                public override applyValue(value: number, delta?: {
                    changeX: number,
                    changeY: number,
                    distance: number
                }): boolean {
                    if (delta) {
                        for (let block of this.blocks) {
                            block.move(block.position.x + delta.changeX, block.position.y, false, true);
                        }
                    } else {
                        for (let block of this.blocks) {
                            block.move(value, block.position.y, false, true);
                        }
                    }

                    return true;
                }
            },
            /**
             * Represents the Y-coordinate property of an editor block.
             */
            class YProperty<T extends EditorBlock = EditorBlock> extends NumberProperty<T> {

                /**
                 * Initializes the YProperty with a label and identifier.
                 */
                constructor() {
                    super($t("property.position.y"), "base-position-y");
                }

                /**
                 * Determines if the property is visible.
                 * @returns {boolean} Always true.
                 */
                public override isVisible(): boolean {
                    return true;
                }

                /**
                 * Sets up event listeners for the Y-coordinate property.
                 */
                public override setup(): void {
                    super.setup();

                    this.editorProperty.getEditor().events.BLOCK_POSITION_CHANGED.on((data) => {
                        this.processRecalculateValues();
                    });
                }

                /**
                 * Recalculates the Y-coordinate value based on the blocks' current positions.
                 * @param change Callback to update the recalculated value.
                 */
                public override recalculateValues(change: (value: number) => void): void {
                    let defaultY: string | number = this.blocks[0].position.y;

                    if (!this.blocks.every(block => block.position.y === defaultY)) {
                        defaultY = "";
                    }

                    change(defaultY as number);
                }

                /**
                 * Applies a new Y-coordinate value to the blocks.
                 * @param value The new Y-coordinate value.
                 * @param delta Optional delta for position adjustment.
                 * @returns {boolean} Always true.
                 */
                public override applyValue(value: number, delta?: {
                    changeX: number,
                    changeY: number,
                    distance: number
                }): boolean {
                    if (delta) {
                        for (let block of this.blocks) {
                            block.move(block.position.x, block.position.y + delta.changeX, false, true);
                        }
                    } else {
                        for (let block of this.blocks) {
                            block.move(block.position.x, value, false, true);
                        }
                    }

                    return true;
                }
            },
        ]);
    }

    /**
     * Determines if the position property is visible.
     * @returns {boolean} True if only one block is selected, false otherwise.
     */
    public override isVisible(): boolean {
        return this.blocks.length === 1;
    }

}
