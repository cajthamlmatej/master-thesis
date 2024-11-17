import {Block} from "@/editor/block/Block";
import {generateUUID} from "@/utils/Generators";

export class WatermarkBlock extends Block {
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

    override getContent() {
        return undefined;
    }

    override onMounted() {
        super.onMounted();

        this.size.height = 50;
        this.size.width = 200;

        this.position = this.getPosition();
    }

    override move(x: number, y: number) {
        this.position = this.getPosition();
    }

    public onMovementCompleted(start: { x: number; y: number }) {
        super.onMovementCompleted(start);

        this.position = this.getPosition();
    }

    public override clone(): Block {
        return new WatermarkBlock(generateUUID());
    }

    public override serialize(): Object {
        return {
            ...this.serializeBase()
        }
    }

    private getPosition() {
        return {
            x: 30,
            y: this.editor.getSize().height - 30 - 50
        }
    }
}
