import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {generateUUID} from "@/utils/Generators";

export class DeselectBlockApiFeature extends EditorPluginApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "deselectBlock", context.newFunction("deselectBlock", (blockIdRaw) => {
            const blockId = context.dump(blockIdRaw);

            if(typeof blockId !== "string") {
                plugin.log(`Invalid parameters for selectBlock, blockId must be a string`);
                return context.undefined;
            }

            if(!editor.getBlockById(blockId)) {
                plugin.log(`Block with id ${blockId} does not exist`);
                return context.undefined
            }

            editor.getSelector().deselectBlock(blockId);

            return context!.undefined;
        }));
    }

}
