import {ApiFeature} from "@/editor/plugin/editor/ApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";
import {generateUUID} from "@/utils/Generators";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockApiFeature} from "@/editor/plugin/editor/BlockApiFeature";

export class RotateBlockApiFeature extends BlockApiFeature {
    register(obj: QuickJSHandle, data: ApiData, block: EditorBlock): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "rotate", context.newFunction("rotate", (degreesRaw) => {
            const degrees = context.dump(degreesRaw);

            if(typeof degrees !== "number") {
                plugin.log(`[Plugin ${plugin.getName()}] Rotate block failed: degrees must be a number`);
                return context.undefined;
            }

            block.rotate(degrees, false, true);
            return context.undefined;
        }));
    }

}
