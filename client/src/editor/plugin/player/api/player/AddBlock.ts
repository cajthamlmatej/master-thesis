import {QuickJSHandle} from "quickjs-emscripten";
import {generateUUID} from "@/utils/Generators";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";

/**
 * Provides an API feature to add a new block to the player.
 */
export class AddBlockApiFeature extends PlayerPluginApiFeature {
    /**
     * Registers the `addBlock` method to the provided QuickJS object.
     * 
     * @param obj - The QuickJS object to which the method is added.
     * @param data - The API data containing context, plugin, and player information.
     */
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const player = data.player;

        context.setProp(obj, "addBlock", context.newFunction("addBlock", (data) => {
            const parsedData = context!.dump(data)

            if (!parsedData.id) {
                parsedData.id = generateUUID();
            }

            if (parsedData.type === "plugin") {
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
