import {ShapeEditorBlock} from "@/editor/block/shape/ShapeEditorBlock";
import {SelectProperty} from "@/editor/property/type/SelectProperty";
import {shapes} from "@/editor/block/shape/Shapes";

export class ShapeProperty<T extends ShapeEditorBlock = ShapeEditorBlock> extends SelectProperty<T> {

    constructor() {
        super("Shape", "shape", [
            ...shapes.map(shape => ({
                value: shape.name,
                label: shape.label
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
