import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";

export class SetBlockZIndexApiFeature extends EditorBlockApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData, block: EditorBlock): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "setZIndex", context.newFunction("setZIndex", (zIndexRaw) => {
            const zIndex = context.dump(zIndexRaw);

            if (typeof zIndex !== "number") {
                plugin.log(`[Plugin ${plugin.getName()}] Set block z-index failed: z-index must be a number`);
                return context.undefined;
            }

            block.setZIndex(zIndex);
            return context.undefined;
        }));
    }

}
