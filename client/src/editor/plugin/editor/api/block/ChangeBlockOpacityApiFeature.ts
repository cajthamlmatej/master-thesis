import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {generateUUID} from "@/utils/Generators";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";

export class ChangeBlockOpacityApiFeature extends EditorBlockApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData, block: EditorBlock): void {
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
