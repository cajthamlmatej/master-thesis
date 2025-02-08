import {Property} from "@/editor/property/Property";
import {NumberProperty} from "@/editor/property/type/NumberProperty";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {$t} from "@/translation/Translation";

export class OpacityProperty<T extends EditorBlock = EditorBlock> extends NumberProperty<T> {

    constructor() {
        super($t("property.opacity.label"), "base-opacity");
    }

    public override isVisible(): boolean {
        return true;
    }

    public override setup(): void {
        super.setup();

        this.editorProperty.getEditor().events.BLOCK_OPACITY_CHANGED.on((data) => {
            if(data.manual)
                return;

            this.processRecalculateValues();
        });
    }

    public override recalculateValues(change: (value: number) => void): void {
        let defaultOpacity: number = this.blocks[0].opacity;

        if (!this.blocks.every(block => block.opacity == defaultOpacity)) {
            defaultOpacity = 0;
        }

        change(Math.floor(defaultOpacity * 1000 * 100) / 1000);
    }

    public override applyValue(value: number, delta?: { changeX: number, changeY: number, distance: number }): boolean {
        if (delta) {
            let changeAmount = delta.changeX / 1000;
            let anyHitCapacity = false;
            for (let block of this.blocks) {
                let target = Math.floor((block.opacity + changeAmount) * 1000) / 1000;

                if(target <= 0 || target >= 1) {
                    anyHitCapacity = true;
                    target = Math.min(1, Math.max(0, target));
                }

                block.changeOpacity(target, true);
            }

            if(anyHitCapacity) {
                return false;
            }
        } else {
            for (let block of this.blocks) {
                block.changeOpacity(value, true);
            }
        }

        return true;
    }
}
