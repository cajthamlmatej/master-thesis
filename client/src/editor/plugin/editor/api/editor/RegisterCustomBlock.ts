import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";

export class RegisterCustomBlockApiFeature extends EditorPluginApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "registerCustomBlock", context.newFunction("registerCustomBlock", (rawData) => {
            const {
                name,
                icon,
                id
            } = context!.dump(rawData)

            if (!name || !icon || !id) {
                plugin.log("Missing name, icon or id when registering custom block");
                return;
            }

            data.pluginManager.registerCustomBlock({
                name: name,
                icon: icon,
                id: id,
                pluginId: plugin.getId()
            });
        }));
    }

}
