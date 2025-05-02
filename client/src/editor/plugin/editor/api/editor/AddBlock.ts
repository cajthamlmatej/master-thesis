import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {generateUUID} from "@/utils/Generators";

/**
 * Provides the "addBlock" API feature for the editor plugin.
 * This feature allows adding a new block to the editor.
 */
export class AddBlockApiFeature extends EditorPluginApiFeature {
    /**
     * Registers the "addBlock" function in the plugin API.
     * 
     * @param obj - The QuickJS object to which the function is added.
     * @param data - The API data containing context, plugin, and editor references.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "addBlock", context.newFunction("addBlock", (data) => {
            const parsedData = context!.dump(data)

            if (!parsedData.id) {
                parsedData.id = generateUUID();
            }

            if (parsedData.type === "plugin") {
                parsedData.plugin = plugin.getId();
            }

            const block = editor.blockRegistry.deserializeEditor(parsedData);

            if (!block) {
                plugin.log(`Could not deserialize block`);
                return context!.undefined;
            }

            editor.addBlock(block, true);

            editor.getSelector().selectBlock(block);

            return context.newString(parsedData.id);
        }));
    }

}
