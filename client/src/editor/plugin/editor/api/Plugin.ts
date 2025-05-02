import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";

/**
 * Represents a feature for managing plugin-related API functionality.
 * This feature registers the plugin's ID into the JavaScript context.
 */
export class PluginApiFeature extends EditorPluginApiFeature {
    /**
     * Registers the plugin's ID into the JavaScript context.
     * 
     * @param obj - The QuickJS object to which the property will be added.
     * @param data - The data containing the plugin and context information.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const id = data.plugin.getId();

        context.setProp(obj, "plugin", context.newString(id));
    }

}
