import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {generateUUID} from "@/utils/Generators";
import {Property} from "@/editor/property/Property";
import {ColorProperty} from "@/editor/property/base/ColorProperty";
import {shapes} from "@/editor/block/shape/Shapes";

export class ShapeEditorBlock extends EditorBlock {
    @BlockSerialize("color")
    public color: string;
    @BlockSerialize("shape")
    public shape: string;

    constructor(id: string, position: { x: number, y: number }, size: { width: number, height: number }, rotation: number, zIndex: number, color: string, shape: string) {
        super(id, "shape", position, size, rotation, zIndex);
        this.color = color;
        this.shape = shape;
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-shape");

        const content = document.createElement("div");
        content.classList.add("block-content");

        element.appendChild(content);

        return element;
    }

    override synchronize() {
        super.synchronize();

        const content = this.element.querySelector(".block-content")! as HTMLElement;
        content.style.setProperty("--color", this.color);

        const shape = shapes.find(s => s.name === this.shape);

        if(!shape) {
            console.error("[ShapeEditorBlock] Shape not found: " + this.shape);
            // Render red error box with red text
            content.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <rect x="0" y="0" width="100" height="100" fill="red" />
  <text x="50" y="50" fill="white" font-size="10" text-anchor="middle" dominant-baseline="middle" id="error-text">${this.shape}</text>
</svg>`;
            return;
        }

        content.innerHTML = shape.html;
        for(const c of shape.class || [])
            content.classList.add(c);
    }

    editorSupport(): { group: boolean; selection: boolean; movement: boolean; proportionalResizing: boolean; nonProportionalResizingX: boolean; nonProportionalResizingY: boolean; rotation: boolean; zIndex: boolean; lock: boolean } {
        const shape = shapes.find(s => s.name === this.shape);

        if(!shape || shape.nonProportionalResizing) {
            return super.editorSupport();
        }

        return {
            ...super.editorSupport(),
            nonProportionalResizingY: false,
            nonProportionalResizingX: false
        }
    }

    override clone(): EditorBlock {
        return new ShapeEditorBlock(
            generateUUID(), // note(Matej): TODO: Is this ok? And it is in multiple places.
            {x: this.position.x, y: this.position.y},
            {width: this.size.width, height: this.size.height},
            this.rotation,
            this.zIndex,
            this.color,
            this.shape);
    }


    override getProperties(): Property<this>[] {
        return [
            ...super.getProperties(),
            new ColorProperty()
        ];
    }

    changeColor(value: string) {
        this.color = value;

        this.synchronize();
    }

    changeShape(value: string) {
        this.shape = value;

        this.synchronize();
        this.matchRenderedHeight();
    }
}
