import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";

export class PluginPlayerBlock extends PlayerBlock {
    @BlockSerialize("plugin")
    private plugin: string;
    @BlockSerialize("data")
    private data: Record<string, string>;

    constructor(base: BlockConstructorWithoutType, plugin: string, data: Record<string, string>) {
        super({
            ...base,
            type: "plugin",
        });

        this.plugin = plugin;
        this.data = data;
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-plugin");

        return element;
    }
}