import {Block} from "@/editor/block/Block";
import {BlockType} from "@/editor/block/BlockType";

export class RectangleBlock extends Block {
    private color: string;

    constructor(id: string, position: { x: number, y: number }, size: { width: number, height: number }, color: string) {
        super(id, BlockType.TEXT, position, size);
        this.color = color;
    }

    render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-rectangle");

        element.style.backgroundColor = this.color;

        return element;
    }

    override editorSupport() {
        return {
            selection: true,
            movement: true,
            proportionalResizing: true,
            nonProportionalResizingX: true,
            nonProportionalResizingY: true,
            rotation: true
        }
    }

    override getContent() {
        return undefined;
    }

    override synchronize() {
        super.synchronize();

        this.element.style.backgroundColor = this.color;
    }

}
