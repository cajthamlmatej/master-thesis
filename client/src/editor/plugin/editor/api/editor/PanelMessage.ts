import {ApiFeature} from "@/editor/plugin/editor/ApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";
import {generateUUID} from "@/utils/Generators";
import {EditorPluginEvent} from "@/editor/plugin/editor/EditorPluginEvent";

export class PanelMessageApiFeature extends ApiFeature {
    register(obj: QuickJSHandle, data: ApiData): void {
        const context = data.context;
        const editorPlugin = data.editorPlugin;
        const plugin = data.plugin;

        context.setProp(obj, "sendPanelMessage", context.newFunction("sendPanelMessage", (messageRaw) => {
            const message = context.getString(messageRaw);

            editorPlugin.sendMessageToPanel(message);

            return context.undefined;
        }));
    }

}
