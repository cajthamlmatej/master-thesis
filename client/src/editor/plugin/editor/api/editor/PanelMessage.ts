import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";

/**
 * Provides the "sendPanelMessage" API feature for the editor plugin.
 * This feature allows sending messages to the editor panel.
 */
export class PanelMessageApiFeature extends EditorPluginApiFeature {
    /**
     * Registers the "sendPanelMessage" function in the plugin API.
     * 
     * @param obj - The QuickJS object to which the function is added.
     * @param data - The API data containing context, plugin, and editor references.
     */
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
