import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerMode} from "@/editor/player/PlayerMode";

/**
 * Provides an API feature to set the player's mode.
 */
export class SetModeApiFeature extends PlayerPluginApiFeature {
    /**
     * Registers the `setMode` method to the provided QuickJS object.
     * 
     * @param obj - The QuickJS object to which the method is added.
     * @param data - The API data containing context, plugin, and player information.
     */
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const player = data.player;

        context.setProp(obj, "setMode", context.newFunction("setMode", (data) => {
            const type = context!.dump(data);

            if (!(type in Object.keys(PlayerMode))) {
                plugin.log(`Invalid mode ${type}`);
                return context!.undefined;
            }

            player.changeMode(type as PlayerMode);
            return context!.undefined;
        }));
    }

}
