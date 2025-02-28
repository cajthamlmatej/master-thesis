import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";

export class PluginPlayerBlock extends PlayerBlock {
    constructor(base: BlockConstructorWithoutType) {
        super({
            ...base,
            type: "plugin",
        });
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-plugin");

        return element;
    }
}