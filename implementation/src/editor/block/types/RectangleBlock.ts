import {Block} from "@/editor/block/Block";
import {BlockType} from "@/editor/block/BlockType";
import {generateUUID} from "@/utils/uuid";

export class RectangleBlock extends Block {
    private color: string;

    constructor(id: string, position: { x: number, y: number }, size: { width: number, height: number }, rotation: number, zIndex: number, color: string) {
        super(id, BlockType.RECTANGLE, position, size, rotation, zIndex);
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
            rotation: true,
            zIndex: true,
            lock: true,
        }
    }

    override getContent() {
        return undefined;
    }

    override synchronize() {
        super.synchronize();

        this.element.style.backgroundColor = this.color;
    }

    override clone(): Block {
        return new RectangleBlock(
            generateUUID(), // note(Matej): TODO: Is this ok? And it is in multiple places.
            {x: this.position.x, y: this.position.y},
            {width: this.size.width, height: this.size.height},
            this.rotation,
            this.zIndex,
            this.color);
    }
}
