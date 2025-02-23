import {ApiFeature} from "@/editor/plugin/editor/ApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";
import {generateUUID} from "@/utils/Generators";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockApiFeature} from "@/editor/plugin/editor/BlockApiFeature";

export class ChangeBlockOpacityApiFeature extends BlockApiFeature {
    register(obj: QuickJSHandle, data: ApiData, block: EditorBlock): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "changeOpacity", context.newFunction("changeOpacity", (opacityRaw) => {
            const opacity = context.dump(opacityRaw);

            if(typeof opacity !== "number") {
                plugin.log(`[Plugin ${plugin.getName()}] Change opacity failed: opacity must be a number`);
                return context.undefined;
            }
            if(opacity < 0 || opacity > 1) {
                plugin.log(`[Plugin ${plugin.getName()}] Change opacity failed: opacity must be between 0 and 1`);
                return context.undefined;
            }

            block.changeOpacity(opacity, true);

            return context.undefined;
        }));
    }

}
