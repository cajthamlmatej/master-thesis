import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";

/**
 * Feature to allow plugins to resize an editor block.
 */
export class ResizeBlockApiFeature extends EditorBlockApiFeature {
    /**
     * Registers the `resize` function in the plugin API.
     * 
     * @param obj - The QuickJS object to which the function is added.
     * @param data - The plugin API data containing context, plugin, and editor references.
     * @param block - The editor block to be resized.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData, block: EditorBlock): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "resize", context.newFunction("resize", (widthRaw, heightRaw) => {
            const width = context.dump(widthRaw);
            const height = context.dump(heightRaw);

            if (typeof width !== "number" || typeof height !== "number") {
                plugin.log(`[Plugin ${plugin.getName()}] Resize block failed: width and height must be numbers`);
                return context.undefined;
            }

            if (width <= 1 || height <= 1) {
                plugin.log(`[Plugin ${plugin.getName()}] Resize block failed: width and height must be greater than 1`);
                return context.undefined;
            }

            block.resize(width, height, false, true);
            return context.undefined;
        }));
    }

}
