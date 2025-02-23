import {ApiFeature} from "@/editor/plugin/editor/ApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";
import {generateUUID} from "@/utils/Generators";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {BlockApiFeature} from "@/editor/plugin/editor/api/BlockApiFeature";

export class ResizeBlockApiFeature extends BlockApiFeature {
    register(obj: QuickJSHandle, data: ApiData, block: EditorBlock): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "resize", context.newFunction("resize", (widthRaw, heightRaw) => {
            const width = context.dump(widthRaw);
            const height = context.dump(heightRaw);

            if(typeof width !== "number" || typeof height !== "number") {
                plugin.log(`[Plugin ${plugin.getName()}] Resize block failed: width and height must be numbers`);
                return context.undefined;
            }

            if (width <= 1 || height <= 1) {
                plugin.log(`[Plugin ${plugin.getName()}] Resize block failed: width and height must be greater than 1`);
                return context.undefined;
            }

            block.resize(width, height, false, true);
            return context.undefined;
        }));
    }

}
