import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {Property} from "@/editor/property/Property";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {PluginProperty} from "@/editor/block/base/plugin/PluginProperty";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {BlockEventListener} from "@/editor/block/events/BlockListener";
import {PluginPropertyFactory} from "@/editor/block/base/plugin/PluginPropertyFactory";

export class PluginEditorBlock extends EditorBlock {
    @BlockSerialize("plugin")
    private plugin: string;
    @BlockSerialize("data")
    private data: Record<string, string>;
    @BlockSerialize("properties")
    private properties: PluginProperty[] = [];

    constructor(base: BlockConstructorWithoutType, plugin: string, data: Record<string, string>, properties: PluginProperty[]) {
        super({
            ...base,
            type: "plugin",
        });

        this.plugin = plugin;
        this.data = data;
        this.properties = properties;
    }

    override render(): HTMLElement {
        const element = document.createElement("div");

        element.classList.add("block");
        element.classList.add("block--type-plugin");

        const content = document.createElement("div");

        content.classList.add("block-content");
        element.appendChild(content);

        return element;
    }

    private async renderIframe() {
        const content = (this.element.querySelector(".block-content")! as HTMLElement);

        const render = await this.editor.getBlockRenderer().render(this);

        try {
            content.removeAttribute("data-processed");

            content.innerHTML = "";

            const iframe = document.createElement("iframe");
            iframe.srcdoc = render;
            iframe.setAttribute("sandbox", "allow-scripts");

            content.appendChild(iframe);
        } catch (e) {
            console.error(e);
        }
    }

    @BlockEventListener(BlockEvent.MOUNTED)
    public onMounted() {
        this.renderIframe();

    }
    }

    public getDataField(key: string): any {
        return this.data[key];
    }

    public setDataField(key: string, value: any) {
        this.data[key] = value;

        // this.renderIframe();
    }

    public override getProperties(): Property<this>[] {
        const factory = new PluginPropertyFactory();

        const pluginProperties = [] as Property<PluginEditorBlock>[];

        for(const property of this.properties) {
            pluginProperties.push(factory.createProperty(property))
        }

        return [
            ...super.getProperties(),
            ...pluginProperties,
        ] as Property<this>[];
    }

    override editorSupport() {
        return {
            group: true,
            selection: true,
            movement: true,
            proportionalResizing: true,
            nonProportionalResizingX: true,
            nonProportionalResizingY: true,
            rotation: true,
            zIndex: true,
            lock: true,
        }
    }

    override clone(): EditorBlock {
        return new PluginEditorBlock(this.getCloneBase(), this.plugin, this.data, this.properties);
    }

    getPlugin() {
        return this.plugin;
    }
}
