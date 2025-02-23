import {ApiFeature} from "@/editor/plugin/editor/ApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";
import {generateUUID} from "@/utils/Generators";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockApiFeature} from "@/editor/plugin/editor/BlockApiFeature";

export class SetBlockZIndexApiFeature extends BlockApiFeature {
    register(obj: QuickJSHandle, data: ApiData, block: EditorBlock): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "setZIndex", context.newFunction("setZIndex", (zIndexRaw) => {
            const zIndex = context.dump(zIndexRaw);

            if(typeof zIndex !== "number") {
                plugin.log(`[Plugin ${plugin.getName()}] Set block z-index failed: z-index must be a number`);
                return context.undefined;
            }

            block.setZIndex(zIndex);
            return context.undefined;
        }));
    }

}
