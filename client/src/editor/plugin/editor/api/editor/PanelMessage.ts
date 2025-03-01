import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {generateUUID} from "@/utils/Generators";
import {EditorPluginEvent} from "@/editor/plugin/editor/EditorPluginEvent";

export class PanelMessageApiFeature extends EditorPluginApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
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
