import {EditorBlock} from "@/editor/block/EditorBlock";
import {generateUUID} from "@/utils/Generators";
import type {Type} from "@/utils/TypeScriptTypes";
import type {Property} from "@/editor/property/Property";
import {ColorProperty} from "@/editor/property/base/ColorProperty";

export class RectangleEditorBlock extends EditorBlock {
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

    override editorSupport() {
        return {
            group: true,
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

    override clone(): EditorBlock {
        return new RectangleEditorBlock(
            generateUUID(), // note(Matej): TODO: Is this ok? And it is in multiple places.
            {x: this.position.x, y: this.position.y},
            {width: this.size.width, height: this.size.height},
            this.rotation,
            this.zIndex,
            this.color);
    }


    getProperties(): Property[] {
        return [
            ...super.getProperties(),
            new ColorProperty("color")
        ];
    }

    public override serialize(): Object {
        return {
            ...this.serializeBase(),
            color: this.color,
        }
    }
}
