import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";

export class LogApiFeature extends PlayerPluginApiFeature {
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;

        context.setProp(obj, "log", context.newFunction("log", (args) => {
            plugin.log(context!.dump(args), true);
            return context!.undefined;
        }));
    }

}
