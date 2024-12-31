import {Property} from "@/editor/property/Property";
import {NumberProperty} from "@/editor/property/type/NumberProperty";
import type {EditorBlock} from "@/editor/block/EditorBlock";

export class RotationProperty<T extends EditorBlock = EditorBlock> extends NumberProperty<T> {

    constructor() {
        super("Rotation", "base-rotation");
    }

    public override isVisible(): boolean {
        return true;
    }

    public override setup(): void {
        super.setup();

        this.editorProperty.getEditor().events.BLOCK_ROTATION_CHANGED.on((data) => {
            if(data.manual)
                return;

            this.processRecalculateValues();
        });
    }

    public override recalculateValues(change: (value: number) => void): void {
        let defaultRotation: number = this.blocks[0].rotation;

        if (!this.blocks.every(block => block.rotation == defaultRotation)) {
            defaultRotation = 0;
        }

        change(defaultRotation);
    }

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
