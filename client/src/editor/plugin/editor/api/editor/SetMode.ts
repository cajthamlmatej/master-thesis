import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorMode} from "@/editor/EditorMode";

export class SetModeApiFeature extends EditorPluginApiFeature {
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
