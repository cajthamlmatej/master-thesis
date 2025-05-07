import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";

/**
 * Provides the "selectBlock" API feature for the editor plugin.
 * This feature allows selecting a block in the editor.
 */
export class SelectBlockApiFeature extends EditorPluginApiFeature {
    /**
     * Registers the "selectBlock" function in the plugin API.
     * 
     * @param obj - The QuickJS object to which the function is added.
     * @param data - The API data containing context, plugin, and editor references.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "selectBlock", context.newFunction("selectBlock", (blockIdRaw, addToSelectionRaw) => {
            const blockId = context.dump(blockIdRaw);
            const addToSelection = context.dump(addToSelectionRaw);

            if (typeof blockId !== "string") {
                plugin.log(`Invalid parameters for selectBlock, blockId must be a string`);
                return context.undefined;
            }

            if (typeof addToSelection !== "boolean" && addToSelection !== undefined) {
                plugin.log(`Invalid parameters for selectBlock, addToSelection must be a boolean or undefined`);
                return context.undefined;
            }

            if (!editor.getBlockById(blockId)) {
                plugin.log(`Block with id ${blockId} does not exist`);
                return context.undefined
            }

            editor.getSelector().selectBlock(blockId, addToSelection ?? false);

            return context!.undefined;
        }));
    }

}
