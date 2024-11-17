import {PlayerBlock} from "@/editor/block/PlayerBlock";

export class WatermarkPlayerBlock extends PlayerBlock {
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


    synchronize() {
        this.position.x = 30;
        this.position.y = this.player.getSize().height - 30 - 50
        super.synchronize();
    }
}
