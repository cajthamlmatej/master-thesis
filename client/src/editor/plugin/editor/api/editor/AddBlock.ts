import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {generateUUID} from "@/utils/Generators";

export class AddBlockApiFeature extends EditorPluginApiFeature {
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
