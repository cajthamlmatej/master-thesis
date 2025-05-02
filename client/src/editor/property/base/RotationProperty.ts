import {NumberProperty} from "@/editor/property/type/NumberProperty";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {$t} from "@/translation/Translation";

/**
 * Represents a property for managing the rotation of editor blocks.
 */
export class RotationProperty<T extends EditorBlock = EditorBlock> extends NumberProperty<T> {

    /**
     * Initializes the RotationProperty with a label and identifier.
     */
    constructor() {
        super($t("property.rotation.label"), "base-rotation");
    }

    /**
     * Determines if the property is visible.
     * @returns {boolean} Always true.
     */
    public override isVisible(): boolean {
        return true;
    }

    /**
     * Sets up event listeners for the rotation property.
     */
    public override setup(): void {
        super.setup();

        this.editorProperty.getEditor().events.BLOCK_ROTATION_CHANGED.on((data) => {
            if (data.manual)
                return;

            this.processRecalculateValues();
        });
    }

    /**
     * Recalculates the rotation value based on the blocks' current rotations.
     * @param change Callback to update the recalculated value.
     */
    public override recalculateValues(change: (value: number) => void): void {
        let defaultRotation: number = this.blocks[0].rotation;

        if (!this.blocks.every(block => block.rotation == defaultRotation)) {
            defaultRotation = 0;
        }

        change(defaultRotation);
    }

    /**
     * Applies a new rotation value to the blocks.
     * @param value The new rotation value.
     * @param delta Optional delta for rotation adjustment.
     * @returns {boolean} Always true.
     */
    public override applyValue(value: number, delta?: { changeX: number, changeY: number, distance: number }): boolean {
        if (delta) {
            for (let block of this.blocks) {
                block.rotate((block.rotation + delta.changeX) % 360, false, true);
            }
        } else {
            for (let block of this.blocks) {
                block.rotate(value, false, true);
            }
        }

        return true;
    }
}
