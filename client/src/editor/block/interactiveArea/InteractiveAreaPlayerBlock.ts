import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";

export class InteractiveAreaPlayerBlock extends PlayerBlock {
    constructor(base: BlockConstructorWithoutType) {
        super({
            ...base,
            type: "interactiveArea",
        });
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-interactiveArea");

        return element;
    }

    override synchronize() {
        super.synchronize();

        this.element.style.zIndex = "1001";
    }

}
