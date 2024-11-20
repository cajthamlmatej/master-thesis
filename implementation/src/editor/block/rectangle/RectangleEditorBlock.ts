import {EditorBlock} from "@/editor/block/EditorBlock";
import {generateUUID} from "@/utils/Generators";
import type {Type} from "@/utils/TypeScriptTypes";
import type {Property} from "@/editor/property/Property";
import {ColorProperty} from "@/editor/property/base/ColorProperty";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";

export class RectangleEditorBlock extends EditorBlock {
    @BlockSerialize("color")
    private color: string;

    constructor(id: string, position: { x: number, y: number }, size: { width: number, height: number }, rotation: number, zIndex: number, color: string) {
        super(id, "rectangle", position, size, rotation, zIndex);
        this.color = color;
    }

    override render(): HTMLElement {
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

    override clone(): EditorBlock {
        return new RectangleEditorBlock(
            generateUUID(), // note(Matej): TODO: Is this ok? And it is in multiple places.
            {x: this.position.x, y: this.position.y},
            {width: this.size.width, height: this.size.height},
            this.rotation,
            this.zIndex,
            this.color);
    }


    override getProperties(): Property[] {
        return [
            ...super.getProperties(),
            new ColorProperty("color")
        ];
    }
}
