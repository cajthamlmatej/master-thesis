import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";

export class GetBlocksApiFeature extends EditorPluginApiFeature {
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
