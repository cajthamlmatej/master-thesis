import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";

export class IframePlayerBlock extends PlayerBlock {
    private content: string;

    constructor(base: BlockConstructorWithoutType, content: string) {
        super({
            ...base,
            type: "iframe",
        });
        this.content = content;
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-iframe");

        return element;
    }
}
