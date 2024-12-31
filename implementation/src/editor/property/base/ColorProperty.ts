import {Property} from "@/editor/property/Property";
import {ColorProperty as BaseColorProperty} from "@/editor/property/type/ColorProperty";
import {RectangleEditorBlock} from "@/editor/block/rectangle/RectangleEditorBlock";

export class ColorProperty extends BaseColorProperty<RectangleEditorBlock> {

    constructor() {
        super("Background Color", "backgroundColor");
    }

    public override isVisible(): boolean {
        return this.blocks.every(block => "color" in block);
    }

    public override destroy(): void {
        this.element.innerHTML = "";
    }

    applyValue(value: string): boolean {
        for (let block of this.blocks) {
            block.changeColor(value);
            block.synchronize();
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
