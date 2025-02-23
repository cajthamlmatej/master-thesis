import {ApiFeature} from "@/editor/plugin/editor/ApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";
import {generateUUID} from "@/utils/Generators";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockApiFeature} from "@/editor/plugin/editor/BlockApiFeature";

export class MoveBlockApiFeature extends BlockApiFeature {
    register(obj: QuickJSHandle, data: ApiData, block: EditorBlock): void {
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
