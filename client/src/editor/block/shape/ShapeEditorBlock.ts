import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {Property} from "@/editor/property/Property";
import {ColorProperty} from "@/editor/block/shape/property/ColorProperty";
import {shapes} from "@/editor/block/shape/Shapes";
import {ShapeProperty} from "@/editor/block/shape/property/ShapeProperty";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockInteractiveProperty} from "@/editor/interactivity/BlockInteractivity";

export class ShapeEditorBlock extends EditorBlock {
    @BlockSerialize("color")
    public color: string;
    @BlockSerialize("shape")
    public shape: string;

    constructor(base: BlockConstructorWithoutType, color: string, shape: string) {
        super({
            ...base,
            type: "shape"
        });
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

        if (!shape) {
            console.error("[ShapeEditorBlock] Shape not found: " + this.shape);
            // Render red error box with red text
            content.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
  <rect x="0" y="0" width="100" height="100" fill="red" />
  <text x="50" y="50" fill="white" font-size="10" text-anchor="middle" dominant-baseline="middle" id="error-text">${this.shape}</text>
</svg>`;
            return;
        }

        content.innerHTML = shape.html;
        content.className = "block-content";
        for (const c of shape.class || [])
            content.classList.add(c);
    }

    editorSupport(): { group: boolean; selection: boolean; movement: boolean; proportionalResizing: boolean; nonProportionalResizingX: boolean; nonProportionalResizingY: boolean; rotation: boolean; zIndex: boolean; lock: boolean } {
        const shape = shapes.find(s => s.name === this.shape);

        if (!shape || shape.nonProportionalResizing) {
            return super.editorSupport();
        }

        return {
            ...super.editorSupport(),
            nonProportionalResizingY: false,
            nonProportionalResizingX: false
        }
    }

    override clone(): EditorBlock {
        return new ShapeEditorBlock(this.getCloneBase(),
            this.color,
            this.shape
        );
    }


    override getProperties(): Property<this>[] {
        return [
            ...super.getProperties(),
            new ColorProperty(),
            new ShapeProperty(),
        ];
    }

    override getInteractivityProperties(): Omit<BlockInteractiveProperty & { relative: boolean; animate: boolean }, "change" | "reset" | "getBaseValue">[] {
        return [
            ...super.getInteractivityProperties(),
            {
                label: "Color",
                animate: true,
                relative: false
            },
            {
                label: "Shape",
                animate: false,
                relative: false
            }
        ];
    }

    changeColor(value: string) {
        this.color = value;

        this.synchronize();
        this.editor.events.HISTORY.emit();
    }

    changeShape(value: string) {
        this.shape = value;

        this.size.height = this.element.querySelector(".block-content")!.clientHeight;

        const shape = shapes.find(s => s.name === this.shape);

        if (shape && !shape.nonProportionalResizing) {
            this.size.width = this.size.height;
        }

        this.synchronize();

        this.editor.events.BLOCK_CONTENT_CHANGED.emit(this);
        this.editor.events.HISTORY.emit();
    }
}
