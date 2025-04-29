import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlockApiFeature} from "@/editor/plugin/editor/EditorBlockApiFeature";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";

export class SendMessageApiFeature extends EditorBlockApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData, block: PluginEditorBlock): void {
        const context = data.context;

        context.setProp(obj, "sendMessage", context.newFunction("sendMessage", (messageRaw) => {
            const message = context.getString(messageRaw);

            block.sendMessage(message);
            return context.undefined;
        }));
    }

}
