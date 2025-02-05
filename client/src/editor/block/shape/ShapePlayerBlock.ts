import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {shapes} from "@/editor/block/shape/Shapes";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";

export class ShapePlayerBlock extends PlayerBlock {
    private color: string;
    private shape: string;

    constructor(base: BlockConstructorWithoutType, color: string, shape: string) {
        super({
            ...base,
            type: "shape"
        });
        this.color = color;
        this.shape = shape;
    }

    render(): HTMLElement {
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
        content.className = "block-content";
        for(const c of shape.class || [])
            content.classList.add(c);
    }
}
