import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";

/**
 * Provides the "getMode" API feature for the editor plugin.
 * This feature retrieves the current mode of the editor.
 */
export class GetModeApiFeature extends EditorPluginApiFeature {
    /**
     * Registers the "getMode" function in the plugin API.
     * 
     * @param obj - The QuickJS object to which the function is added.
     * @param data - The API data containing context, plugin, and editor references.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "getMode", context.newFunction("getMode", () => {
            return context.newString(editor.getMode().toString())
        }));
    }

}
