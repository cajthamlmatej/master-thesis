import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {generateUUID} from "@/utils/Generators";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";

export class UnlockBlockApiFeature extends EditorBlockApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData, block: EditorBlock): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "unlock", context.newFunction("unlock", () => {
            block.unlock();
            return context.undefined;
        }));
    }

}
