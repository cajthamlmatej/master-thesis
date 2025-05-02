import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";

/**
 * Represents a feature for logging messages from the plugin to the console.
 */
export class LogApiFeature extends EditorPluginApiFeature {
    /**
     * Registers a `log` function into the JavaScript context for logging messages.
     * 
     * @param obj - The QuickJS object to which the `log` function will be added.
     * @param data - The data containing the plugin and context information.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;

        context.setProp(obj, "log", context.newFunction("log", (args) => {
            plugin.log(context!.dump(args), true);
            return context!.undefined;
        }));
    }

}
