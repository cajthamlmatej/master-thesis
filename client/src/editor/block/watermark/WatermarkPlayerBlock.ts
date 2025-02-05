import {PlayerBlock} from "@/editor/block/PlayerBlock";

export class WatermarkPlayerBlock extends PlayerBlock {
    constructor(id: string) {
        super({
            id,
            type: "watermark",
            position: {x: 0, y: 0},
            size: {width: 200, height: 50},
            rotation: 0,
            zIndex: 1001,
        });
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
