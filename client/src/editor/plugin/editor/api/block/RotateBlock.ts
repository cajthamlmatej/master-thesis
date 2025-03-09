import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";

export class RotateBlockApiFeature extends EditorBlockApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData, block: EditorBlock): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "rotate", context.newFunction("rotate", (degreesRaw) => {
            const degrees = context.dump(degreesRaw);

            if (typeof degrees !== "number") {
                plugin.log(`[Plugin ${plugin.getName()}] Rotate block failed: degrees must be a number`);
                return context.undefined;
            }

            block.rotate(degrees, false, true);
            return context.undefined;
        }));
    }

}
