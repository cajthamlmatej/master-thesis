import {ShapeEditorBlock} from "@/editor/block/shape/ShapeEditorBlock";
import {SelectProperty} from "@/editor/property/type/SelectProperty";
import {shapes} from "@/editor/block/shape/Shapes";
import {$t} from "@/translation/Translation";

export class ShapeProperty<T extends ShapeEditorBlock = ShapeEditorBlock> extends SelectProperty<T> {

    constructor() {
        super($t("blocks.shape.property.shape.label"), "shape", [
            ...shapes.map(shape => ({
                value: shape.name,
                label: $t('blocks.shape.' + shape.name)
            }))]);
    }

    public override isVisible(): boolean {
        return this.blocks.every(block => block.type === "shape");
    }

    public override destroy(): void {
        this.element.innerHTML = "";
    }

    applyValue(value: string): boolean {
        for (let block of this.blocks) {
            block.changeShape(value);
        }

        return true;
    }

    recalculateValues(change: (value: string) => void): void {
        let shape: string | number = this.blocks[0].shape;

        if (!this.blocks.every(block => block.shape === shape)) {
            shape = shapes[0].name;
        }

        change(shape);
    }
}
