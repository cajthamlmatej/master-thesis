import {ApiFeature} from "@/editor/plugin/editor/ApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";
import {generateUUID} from "@/utils/Generators";

export class GetBlocksApiFeature extends ApiFeature {
    register(obj: QuickJSHandle, data: ApiData): void {
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
