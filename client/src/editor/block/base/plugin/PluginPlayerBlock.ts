import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {BlockConstructorWithoutType} from "@/editor/block/BlockConstructor";
import {BlockEventListener} from "@/editor/block/events/BlockListener";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {BlockSerialize} from "@/editor/block/serialization/BlockPropertySerialize";
import {RenderApiFeature} from "@/editor/block/base/plugin/api/player/RenderApiFeature";
import {RegisterPlayerBlockApiFeature} from "@/editor/plugin/player/RegisterPlayerBlockApiFeature";
import {SendMessageApiFeature} from "@/editor/block/base/plugin/api/player/SendMessageApiFeature";

@RegisterPlayerBlockApiFeature(RenderApiFeature)
@RegisterPlayerBlockApiFeature(SendMessageApiFeature)
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

        const content = document.createElement("div");

        content.classList.add("block-content");
        element.appendChild(content);

        return element;
    }

    public async renderIframe() {
        console.log("[PluginPlayerBlock] Rendering iframe");
        const content = (this.element.querySelector(".block-content")! as HTMLElement);

        const render = await this.player.getPluginCommunicator().render(this);

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
        console.log("[PluginPlayerBlock] Mounted");
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
                await this.player.getPluginCommunicator().processMessage(this, event.data.message);
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

    getPlugin() {
        return this.plugin;
    }
}
