import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";

/**
 * Provides the "getBlocks" API feature for the editor plugin.
 * This feature retrieves all blocks currently in the editor.
 */
export class GetBlocksApiFeature extends EditorPluginApiFeature {
    /**
     * Registers the "getBlocks" function in the plugin API.
     * 
     * @param obj - The QuickJS object to which the function is added.
     * @param data - The API data containing context, plugin, and editor references.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const editorPlugin = data.editorPlugin;
        const editor = data.editor;

        context.setProp(obj, "getBlocks", context.newFunction("getBlocks", (args) => {
            const blocks = context!.newArray();

            let i = 0;
            for (const block of editor.getBlocks()) {
                const serialized = editorPlugin.serializeBlock(block);

                context!.setProp(blocks, i++, serialized);
            }

            return blocks;
        }));
    }

}
