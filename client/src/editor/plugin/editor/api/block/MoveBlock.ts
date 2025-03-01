import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {generateUUID} from "@/utils/Generators";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";

export class MoveBlockApiFeature extends EditorBlockApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData, block: EditorBlock): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "move", context.newFunction("move", (xRaw, yRaw) => {
            const x = context.dump(xRaw);
            const y = context.dump(yRaw);

            if(typeof x !== "number" || typeof y !== "number") {
                plugin.log(`[Plugin ${plugin.getName()}] Move block failed: x and y must be numbers`);
                return context.undefined;
            }

            block.move(x, y, false, true);
            return context.undefined;
        }));
    }

}
