import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {generateUUID} from "@/utils/Generators";
import {translation} from "@/translation/Translation";

export class PluginApiFeature extends EditorPluginApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const id = data.plugin.getId();

        context.setProp(obj, "plugin", context.newString(id));
    }

}
