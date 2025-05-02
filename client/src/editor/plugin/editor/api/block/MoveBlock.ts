import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";

/**
 * Feature to allow plugins to move an editor block.
 */
export class MoveBlockApiFeature extends EditorBlockApiFeature {
    /**
     * Registers the `move` function in the plugin API.
     * 
     * @param obj - The QuickJS object to which the function is added.
     * @param data - The plugin API data containing context, plugin, and editor references.
     * @param block - The editor block to be moved.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData, block: EditorBlock): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "move", context.newFunction("move", (xRaw, yRaw) => {
            const x = context.dump(xRaw);
            const y = context.dump(yRaw);

            if (typeof x !== "number" || typeof y !== "number") {
                plugin.log(`[Plugin ${plugin.getName()}] Move block failed: x and y must be numbers`);
                return context.undefined;
            }

            block.move(x, y, false, true);
            return context.undefined;
        }));
    }

}
