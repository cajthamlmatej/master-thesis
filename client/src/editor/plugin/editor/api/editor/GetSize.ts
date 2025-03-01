import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {generateUUID} from "@/utils/Generators";

export class GetSizeApiFeature extends EditorPluginApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "getSize", context.newFunction("getSize", (args) => {
            const obj = context!.newObject();

            const height = context!.newNumber(editor.getSize().height);
            const width = context!.newNumber(editor.getSize().width);

            context!.setProp(obj, "height", height);
            context!.setProp(obj, "width", width);

            return obj;
        }));
    }

}
