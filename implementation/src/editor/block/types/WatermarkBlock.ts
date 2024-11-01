import {Block} from "@/editor/block/Block";
import {BlockType} from "@/editor/block/BlockType";
import editor from "@/components/Editor.vue";
import type Editor from "@/editor/Editor";

export class WatermarkBlock extends Block {
    constructor(id: string) {
        super(id, BlockType.TEXT, { x:0, y:0 }, { width: 200, height: 50 });
    }

    render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--watermark");

        element.innerText = "Made by CajthamlMaterials";

        element.style.zIndex = "1000";

        return element;
    }


    override editorSupport() {
        return {
            selection: false,
            movement: false,
            proportionalResizing: false,
            nonProportionalResizingX: false,
            nonProportionalResizingY: false,
            rotation: false
        }
    }

    override getContent() {
        return undefined;
    }

    override onMounted() {
        super.onMounted();

        this.size.height = 50;
        this.size.width = 200;

        this.position = this.getPosition();
    }

    private getPosition() {
        return {
            x: 30,
            y: this.editor.getSize().height - 30 - 50
        }
    }

    override move(x: number, y: number) {
        this.position = this.getPosition();
    }

    onMovementCompleted(start: { x: number; y: number }) {
        super.onMovementCompleted(start);

        this.position = this.getPosition();
    }
}
