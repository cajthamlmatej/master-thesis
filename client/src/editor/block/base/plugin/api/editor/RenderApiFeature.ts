import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";

export class RenderApiFeature extends EditorBlockApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData, block: PluginEditorBlock): void {
        const context = data.context;

        context.setProp(obj, "render", context.newFunction("render", () => {
            block.renderIframe();
            return context.undefined;
        }));
    }

}
