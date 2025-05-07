import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";

/**
 * Feature to allow plugins to change the opacity of an editor block.
 */
export class ChangeBlockOpacityApiFeature extends EditorBlockApiFeature {
    /**
     * Registers the `changeOpacity` function in the plugin API.
     * 
     * @param obj - The QuickJS object to which the function is added.
     * @param data - The plugin API data containing context, plugin, and editor references.
     * @param block - The editor block whose opacity will be modified.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData, block: EditorBlock): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "changeOpacity", context.newFunction("changeOpacity", (opacityRaw) => {
            const opacity = context.dump(opacityRaw);

            if (typeof opacity !== "number") {
                plugin.log(`[Plugin ${plugin.getName()}] Change opacity failed: opacity must be a number`);
                return context.undefined;
            }
            if (opacity < 0 || opacity > 1) {
                plugin.log(`[Plugin ${plugin.getName()}] Change opacity failed: opacity must be between 0 and 1`);
                return context.undefined;
            }

            block.changeOpacity(opacity, true);

            return context.undefined;
        }));
    }

}
