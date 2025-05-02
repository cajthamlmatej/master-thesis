import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";

/**
 * Represents the Log API feature that allows plugins to log messages.
 */
export class LogApiFeature extends PlayerPluginApiFeature {
    /**
     * Registers the Log API feature by setting the "log" property on the provided object.
     * 
     * @param obj - The QuickJS object to which the property will be added.
     * @param data - The data containing the plugin and context information.
     */
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;

        context.setProp(obj, "log", context.newFunction("log", (args) => {
            plugin.log(context!.dump(args), true);
            return context!.undefined;
        }));
    }

}
