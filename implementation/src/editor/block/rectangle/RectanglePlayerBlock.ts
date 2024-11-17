import {PlayerBlock} from "@/editor/block/PlayerBlock";

export class RectanglePlayerBlock extends PlayerBlock {
    private color: string;

    constructor(id: string, position: { x: number, y: number }, size: { width: number, height: number }, rotation: number, zIndex: number, color: string) {
        super(id, "rectangle", position, size, rotation, zIndex);
        this.color = color;
    }

    render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-rectangle");

        element.style.backgroundColor = this.color;

        return element;
    }

    override synchronize() {
        super.synchronize();

        this.element.style.backgroundColor = this.color;
    }

}
