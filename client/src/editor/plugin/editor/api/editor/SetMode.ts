import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorMode} from "@/editor/EditorMode";

/**
 * Provides the "setMode" API feature for the editor plugin.
 * This feature allows changing the editor's mode.
 */
export class SetModeApiFeature extends EditorPluginApiFeature {
    /**
     * Registers the "setMode" function in the plugin API.
     * 
     * @param obj - The QuickJS object to which the function is added.
     * @param data - The API data containing context, plugin, and editor references.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "setMode", context.newFunction("setMode", (data) => {
            const type = context!.dump(data);

            if (!(type in Object.keys(EditorMode))) {
                plugin.log(`Invalid mode ${type}`);
                return context!.undefined;
            }

            editor.setMode(type as EditorMode);
            return context!.undefined;
        }));
    }

}
