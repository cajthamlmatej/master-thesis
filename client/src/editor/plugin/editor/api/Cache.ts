import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";

/**
 * Represents a feature for managing a cache specific to the plugin.
 */
export class CacheApiFeature extends EditorPluginApiFeature {
    /**
     * Registers cache-related functions (`get`, `set`, `remove`) into the JavaScript context.
     * 
     * @param obj - The QuickJS object to which the `cache` object will be added.
     * @param data - The data containing the plugin and context information.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;

        const cacheObj = context.newObject();
        const cache = data.pluginManager.cache.getPluginCache(plugin.getId());

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
