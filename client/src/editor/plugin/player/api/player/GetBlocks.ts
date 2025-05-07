import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";

/**
 * Provides an API feature to retrieve all blocks in the player.
 */
export class GetBlocksApiFeature extends PlayerPluginApiFeature {
    /**
     * Registers the `getBlocks` method to the provided QuickJS object.
     * 
     * @param obj - The QuickJS object to which the method is added.
     * @param data - The API data containing context, plugin, and player information.
     */
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const playerPlugin = data.playerPlugin;
        const player = data.player;

        context.setProp(obj, "getBlocks", context.newFunction("getBlocks", (args) => {
            const blocks = context!.newArray();

            let i = 0;
            for (const block of player.getBlocks()) {
                const serialized = playerPlugin.serializeBlock(block);

                context!.setProp(blocks, i++, serialized);
            }

            return blocks;
        }));
    }

}
