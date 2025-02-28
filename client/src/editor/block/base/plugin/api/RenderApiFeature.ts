import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";
import {BlockApiFeature} from "@/editor/plugin/editor/BlockApiFeature";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";

export class RenderApiFeature extends BlockApiFeature {
    register(obj: QuickJSHandle, data: ApiData, block: PluginEditorBlock): void {
        const context = data.context;

        context.setProp(obj, "render", context.newFunction("render", () => {
            block.renderIframe();
            return context.undefined;
        }));
    }

}
