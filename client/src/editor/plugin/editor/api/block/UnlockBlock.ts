import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";

/**
 * Feature to allow plugins to unlock an editor block.
 */
export class UnlockBlockApiFeature extends EditorBlockApiFeature {
    /**
     * Registers the `unlock` function in the plugin API.
     * 
     * @param obj - The QuickJS object to which the function is added.
     * @param data - The plugin API data containing context, plugin, and editor references.
     * @param block - The editor block to be unlocked.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData, block: EditorBlock): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "unlock", context.newFunction("unlock", () => {
            block.unlock();
            return context.undefined;
        }));
    }

}
