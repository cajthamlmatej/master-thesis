import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";

/**
 * Represents a feature of the Player Plugin API that allows plugins to interact with the player.
 */
export class PluginApiFeature extends PlayerPluginApiFeature {
    /**
     * Registers the plugin API feature by setting the "plugin" property on the provided object.
     * 
     * @param obj - The QuickJS object to which the property will be added.
     * @param data - The data containing the plugin and context information.
     */
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const id = data.plugin.getId();

        context.setProp(obj, "plugin", context.newString(id));
    }

}
