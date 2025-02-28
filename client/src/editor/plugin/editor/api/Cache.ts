import {ApiFeature} from "@/editor/plugin/editor/ApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";

export class CacheApiFeature extends ApiFeature {
    register(obj: QuickJSHandle, data: ApiData): void {
        const context = data.context;
        const plugin = data.plugin;

        const cacheObj = context.newObject();
        const cache = data.pluginManager.cache.getPluginCache(plugin.id);

        context.setProp(cacheObj, "get", context.newFunction("get", (keyRaw) => {
            const key = context!.dump(keyRaw);
            const value = cache.get(key);
            if (value === undefined) return context!.undefined;

            return context!.newString(value);
        }));
        context.setProp(cacheObj, "set", context.newFunction("set", (keyRaw, valueRaw) => {
            const key = context!.dump(keyRaw);
            const value = context!.dump(valueRaw);
            cache.set(key, value);
            return context!.undefined;
        }));
        context.setProp(cacheObj, "remove", context.newFunction("remove", (keyRaw) => {
            const key = context!.dump(keyRaw);
            cache.remove(key);
            return context!.undefined;
        }));

        context.setProp(obj, "cache", cacheObj);
    }

}
