import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";

export class LockBlockApiFeature extends EditorBlockApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData, block: EditorBlock): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "lock", context.newFunction("lock", () => {
            block.lock();
            return context.undefined;
        }));
    }

}
