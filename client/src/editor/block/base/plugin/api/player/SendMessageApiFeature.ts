import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";
import {PlayerBlockApiFeature} from "@/editor/plugin/player/PlayerBlockApiFeature";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PluginPlayerBlock} from "@/editor/block/base/plugin/PluginPlayerBlock";

export class SendMessageApiFeature extends PlayerBlockApiFeature {
    register(obj: QuickJSHandle, data: PlayerPluginApiData, block: PluginPlayerBlock): void {
        const context = data.context;

        context.setProp(obj, "sendMessage", context.newFunction("sendMessage", (messageRaw) => {
            const message = context.getString(messageRaw);

            block.sendMessage(message);
            return context.undefined;
        }));
    }

}
