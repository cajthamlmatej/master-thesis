import {ApiFeature} from "@/editor/plugin/editor/ApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";
import {generateUUID} from "@/utils/Generators";
import {translation} from "@/translation/Translation";

export class PluginApiFeature extends ApiFeature {
    register(obj: QuickJSHandle, data: ApiData): void {
        const context = data.context;
        const id = data.plugin.getId();

        context.setProp(obj, "plugin", context.newString(id));
    }

}
