import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {Property} from "@/editor/property/Property";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {PluginProperty} from "@/editor/block/base/plugin/PluginProperty";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {BlockEventListener} from "@/editor/block/events/BlockListener";
import {PluginPropertyFactory} from "@/editor/block/base/plugin/PluginPropertyFactory";
import {RegisterEditorBlockApiFeature} from "@/editor/plugin/editor/RegisterEditorBlockApiFeature";
import {SendMessageApiFeature} from "@/editor/block/base/plugin/api/editor/SendMessageApiFeature";
import {RenderApiFeature} from "@/editor/block/base/plugin/api/editor/RenderApiFeature";
import {BlockInteractiveProperty} from "@/editor/interactivity/BlockInteractivity";

@RegisterEditorBlockApiFeature(SendMessageApiFeature)
@RegisterEditorBlockApiFeature(RenderApiFeature)
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

    public async renderIframe() {
        const content = (this.element.querySelector(".block-content")! as HTMLElement);

        const render = await this.editor.getPluginCommunicator().render(this);

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

        window.addEventListener("message", async (event) => {
            const content = (this.element.querySelector(".block-content")! as HTMLElement);
            const iframe = content.querySelector("iframe");

            if (!iframe) {
                return;
            }

            if (event.source !== iframe!.contentWindow) {
                return;
            }

            if (event.data.target === "script") {
                await this.editor.getPluginCommunicator().processMessage(this, event.data.message);
            } else {
                console.log("[PluginEditorBlock] Unknown target of received message");
            }
        });
    }

    public sendMessage(message: string) {
        const content = (this.element.querySelector(".block-content")! as HTMLElement);
        const iframe = content.querySelector("iframe");

        if (iframe) {
            iframe.contentWindow?.postMessage({
                target: "block",
                message: message,
            }, "*");
        }
    }

    public getDataField(key: string): any {
        return this.data[key];
    }

    public setDataField(key: string, value: any) {
        this.data[key] = value;

        this.editor.getPluginCommunicator().processPropertyChange(this, key);
    }

    public override getProperties(): Property<this>[] {
        const factory = new PluginPropertyFactory();

        const pluginProperties = [] as Property<PluginEditorBlock>[];

        for (const property of this.properties) {
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
