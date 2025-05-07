import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";

/**
 * Provides the "getSize" API feature for the editor plugin.
 * This feature retrieves the size of the editor canvas.
 */
export class GetSizeApiFeature extends EditorPluginApiFeature {
    /**
     * Registers the "getSize" function in the plugin API.
     * 
     * @param obj - The QuickJS object to which the function is added.
     * @param data - The API data containing context, plugin, and editor references.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "getSize", context.newFunction("getSize", (args) => {
            const obj = context!.newObject();

            const height = context!.newNumber(editor.getSize().height);
            const width = context!.newNumber(editor.getSize().width);

            context!.setProp(obj, "height", height);
            context!.setProp(obj, "width", width);

            return obj;
        }));
    }

}
