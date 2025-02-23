import {ApiFeature} from "@/editor/plugin/editor/ApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";
import {generateUUID} from "@/utils/Generators";

export class SelectBlockApiFeature extends ApiFeature {
    register(obj: QuickJSHandle, data: ApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "selectBlock", context.newFunction("selectBlock", (blockIdRaw, addToSelectionRaw) => {
            const blockId = context.dump(blockIdRaw);
            const addToSelection = context.dump(addToSelectionRaw);

            if(typeof blockId !== "string") {
                plugin.log(`Invalid parameters for selectBlock, blockId must be a string`);
                return context.undefined;
            }

            if(typeof addToSelection !== "boolean" && addToSelection !== undefined) {
                plugin.log(`Invalid parameters for selectBlock, addToSelection must be a boolean or undefined`);
                return context.undefined;
            }

            if(!editor.getBlockById(blockId)) {
                plugin.log(`Block with id ${blockId} does not exist`);
                return context.undefined
            }

            editor.getSelector().selectBlock(blockId, addToSelection ?? false);

            return context!.undefined;
        }));
    }

}
