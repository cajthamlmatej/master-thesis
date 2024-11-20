import {EditorBlock} from "@/editor/block/EditorBlock";
import {generateUUID} from "@/utils/Generators";
import {BlockEventListener} from "@/editor/block/BlockListener";
import {BlockEvent} from "@/editor/block/BlockEvent";

export class WatermarkEditorBlock extends EditorBlock {
    constructor(id: string) {
        super(id, "watermark", {x: 0, y: 0}, {width: 200, height: 50}, 0, 1001);
    }

    render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-watermark");

        element.innerText = "Made by CajthamlMaterials";

        return element;
    }


    override editorSupport() {
        return {
            group: false,
            selection: false,
            movement: false,
            proportionalResizing: false,
            nonProportionalResizingX: false,
            nonProportionalResizingY: false,
            rotation: false,
            zIndex: false,
            lock: false,
        }
    }

    override move(x: number, y: number) {
        this.position = this.calculatePosition();
    }
    override clone(): EditorBlock {
        return new WatermarkEditorBlock(generateUUID());
    }

    override serialize(): Object {
        return {
            ...this.serializeBase()
        }
    }

    private calculatePosition() {
        return {
            x: 30,
            y: this.editor.getSize().height - 30 - 50
        }
    }

    @BlockEventListener(BlockEvent.MOUNTED)
    private onMounted() {
        this.size.height = 50;
        this.size.width = 200;

        this.position = this.calculatePosition();
    }

    @BlockEventListener(BlockEvent.MOVEMENT_ENDED)
    private onMovementCompleted(start: { x: number; y: number }) {
        this.position = this.calculatePosition();
    }

}
