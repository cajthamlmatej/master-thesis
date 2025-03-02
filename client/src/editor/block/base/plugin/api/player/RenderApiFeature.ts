import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";
import {PlayerBlockApiFeature} from "@/editor/plugin/player/PlayerBlockApiFeature";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PluginPlayerBlock} from "@/editor/block/base/plugin/PluginPlayerBlock";

export class RenderApiFeature extends PlayerBlockApiFeature {
    register(obj: QuickJSHandle, data: PlayerPluginApiData, block: PluginPlayerBlock): void {
        const context = data.context;

        context.setProp(obj, "render", context.newFunction("render", () => {
            block.renderIframe();
            return context.undefined;
        }));
    }

}
