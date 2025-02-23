import {ApiFeature} from "@/editor/plugin/editor/ApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";

export class LogApiFeature extends ApiFeature {
    register(obj: QuickJSHandle, data: ApiData): void {
        const context = data.context;
        const plugin = data.plugin;

        context.setProp(obj, "log", context.newFunction("log", (args) => {
            plugin.log(context!.dump(args), true);
            return context!.undefined;
        }));
    }

}
