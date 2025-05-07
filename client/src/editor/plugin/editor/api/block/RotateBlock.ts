import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";

/**
 * Feature to allow plugins to rotate an editor block.
 */
export class RotateBlockApiFeature extends EditorBlockApiFeature {
    /**
     * Registers the `rotate` function in the plugin API.
     * 
     * @param obj - The QuickJS object to which the function is added.
     * @param data - The plugin API data containing context, plugin, and editor references.
     * @param block - The editor block to be rotated.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData, block: EditorBlock): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "rotate", context.newFunction("rotate", (degreesRaw) => {
            const degrees = context.dump(degreesRaw);

            if (typeof degrees !== "number") {
                plugin.log(`[Plugin ${plugin.getName()}] Rotate block failed: degrees must be a number`);
                return context.undefined;
            }

            block.rotate(degrees, false, true);
            return context.undefined;
        }));
    }

}
