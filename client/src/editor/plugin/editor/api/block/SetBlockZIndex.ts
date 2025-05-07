import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";

/**
 * Feature to allow plugins to set the z-index of an editor block.
 */
export class SetBlockZIndexApiFeature extends EditorBlockApiFeature {
    /**
     * Registers the `setZIndex` function in the plugin API.
     * 
     * @param obj - The QuickJS object to which the function is added.
     * @param data - The plugin API data containing context, plugin, and editor references.
     * @param block - The editor block whose z-index will be modified.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData, block: EditorBlock): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "setZIndex", context.newFunction("setZIndex", (zIndexRaw) => {
            const zIndex = context.dump(zIndexRaw);

            if (typeof zIndex !== "number") {
                plugin.log(`[Plugin ${plugin.getName()}] Set block z-index failed: z-index must be a number`);
                return context.undefined;
            }

            block.setZIndex(zIndex);
            return context.undefined;
        }));
    }

}
