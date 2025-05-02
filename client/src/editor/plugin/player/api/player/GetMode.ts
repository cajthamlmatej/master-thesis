import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";

/**
 * Provides an API feature to retrieve the current player mode.
 */
export class GetModeApiFeature extends PlayerPluginApiFeature {
    /**
     * Registers the `getMode` method to the provided QuickJS object.
     * 
     * @param obj - The QuickJS object to which the method is added.
     * @param data - The API data containing context, plugin, and player information.
     */
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const player = data.player;

        context.setProp(obj, "getMode", context.newFunction("getMode", () => {
            return context.newString(player.getMode().toString())
        }));
    }

}
