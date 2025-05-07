import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";

/**
 * Provides the "isBlockSelected" API feature for the editor plugin.
 * This feature checks if a block is selected in the editor.
 */
export class IsBlockSelectedApiFeature extends EditorPluginApiFeature {
    /**
     * Registers the "isBlockSelected" function in the plugin API.
     * 
     * @param obj - The QuickJS object to which the function is added.
     * @param data - The API data containing context, plugin, and editor references.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "isBlockSelected", context.newFunction("isBlockSelected", (blockIdRaw) => {
            const blockId = context.dump(blockIdRaw);

            if (typeof blockId !== "string") {
                plugin.log(`Invalid parameters for selectBlock, blockId must be a string`);
                return context.undefined;
            }

            if (!editor.getBlockById(blockId)) {
                plugin.log(`Block with id ${blockId} does not exist`);
                return context.false
            }

            return editor.getSelector().isSelected(blockId as string) ? context.true : context.false;
        }));
    }

}
