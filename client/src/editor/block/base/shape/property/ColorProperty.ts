import {ColorProperty as BaseColorProperty} from "@/editor/property/type/ColorProperty";

import {ShapeEditorBlock} from "@/editor/block/base/shape/ShapeEditorBlock";
import {$t} from "@/translation/Translation";

export class ColorProperty<T extends ShapeEditorBlock = ShapeEditorBlock> extends BaseColorProperty<T> {

    constructor() {
        super($t("blocks.shape.property.color.label"), "color");
    }

    public override isVisible(): boolean {
        return this.blocks.every(block => block.type === "shape");
    }

    public override destroy(): void {
        this.element.innerHTML = "";
    }

    applyValue(value: string): boolean {
        for (let block of this.blocks) {
            block.changeColor(value);
        }

        return true;
    }

    recalculateValues(change: (value: string) => void): void {
        let color: string | number = this.blocks[0].color;

        if (!this.blocks.every(block => block.color === color)) {
            color = "#ffffff";
        }

        change(color);
    }
}
