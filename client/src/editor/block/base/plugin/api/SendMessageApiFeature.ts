import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";
import {BlockApiFeature} from "@/editor/plugin/editor/BlockApiFeature";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";

export class SendMessageApiFeature extends BlockApiFeature {
    register(obj: QuickJSHandle, data: ApiData, block: PluginEditorBlock): void {
        const context = data.context;

        context.setProp(obj, "sendMessage", context.newFunction("sendMessage", (messageRaw) => {
            const message = context.getString(messageRaw);

            block.sendMessage(message);
            return context.undefined;
        }));
    }

}
