import {ApiFeature} from "@/editor/plugin/editor/ApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";
import {generateUUID} from "@/utils/Generators";

export class GetSizeApiFeature extends ApiFeature {
    register(obj: QuickJSHandle, data: ApiData): void {
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
