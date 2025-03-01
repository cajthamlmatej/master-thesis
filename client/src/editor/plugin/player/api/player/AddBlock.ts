import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {generateUUID} from "@/utils/Generators";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";

export class AddBlockApiFeature extends PlayerPluginApiFeature {
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const player = data.player;

        context.setProp(obj, "addBlock", context.newFunction("addBlock", (data) => {
            const parsedData = context!.dump(data)

            if (!parsedData.id) {
                parsedData.id = generateUUID();
            }

            if(parsedData.type === "plugin") {
                parsedData.plugin = plugin.getId();
            }

            const block = player.blockRegistry.deserializePlayer(parsedData);

            if (!block) {
                plugin.log(`Could not deserialize block`);
                return context!.undefined;
            }

            player.addBlock(block);

            return context.newString(parsedData.id);
        }));
    }

}
