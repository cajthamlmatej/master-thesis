import {ApiFeature} from "@/editor/plugin/editor/ApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";
import {generateUUID} from "@/utils/Generators";
import {EditorMode} from "@/editor/EditorMode";

export class SetModeApiFeature extends ApiFeature {
    register(obj: QuickJSHandle, data: ApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "setMode", context.newFunction("setMode", (data) => {
            const type = context!.dump(data);

            if(!(type in Object.keys(EditorMode))) {
                plugin.log(`Invalid mode ${type}`);
                return context!.undefined;
            }

            editor.setMode(type as EditorMode);
            return context!.undefined;
        }));
    }

}
