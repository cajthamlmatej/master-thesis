import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";

/**
 * Provides the "removeBlock" API feature for the editor plugin.
 * This feature allows removing a block from the editor.
 */
export class RemoveBlockApiFeature extends EditorPluginApiFeature {
    /**
     * Registers the "removeBlock" function in the plugin API.
     * 
     * @param obj - The QuickJS object to which the function is added.
     * @param data - The API data containing context, plugin, and editor references.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "removeBlock", context.newFunction("removeBlock", (args) => {
            const id = context!.dump(args);

            plugin.log(`Removing block ${id}`);
            try {
                editor.removeBlock(id);
            } catch (e) {
                // note(Matej): removal of the block can fail (for example current bug with text editor)
                plugin.log(`Error removing block ${id}`);
            }
            return context!.undefined;
        }));
    }

}
