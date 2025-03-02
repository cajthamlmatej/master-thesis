import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {generateUUID} from "@/utils/Generators";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";

export class FetchApiFeature extends PlayerPluginApiFeature {
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;

        context.setProp(obj, "fetch", context.newFunction("fetch", (urlRaw, optionsRaw) => {
            const promise = context!.newPromise();
            const url = context!.dump(urlRaw);
            const options = optionsRaw ? context!.dump(optionsRaw) : undefined;

            const canExecute = plugin.canExecuteOnUrl(url);

            if (!canExecute) {
                plugin.log(`Cannot execute fetch on url ${url}, check if the domain is allowed in plugin manifest`);
                promise.reject(context!.undefined);
                return promise.handle;
            }

            const optionsToFetch = {} as Record<string, any>;
            if (options !== undefined) {
                if(typeof options !== 'object') {
                    plugin.log(`Options must be an object`);
                    promise.reject(context!.undefined);
                    return promise.handle;
                }

                if(options.headers !== undefined) {
                    if(typeof options.headers !== 'object') {
                        plugin.log(`Headers must be an object`);
                        promise.reject(context!.undefined);
                        return promise.handle;
                    }

                    for(const key in options.headers) {
                        if(typeof options.headers[key] !== 'string') {
                            plugin.log(`Header value must be a string`);
                            promise.reject(context!.undefined);
                            return promise.handle;
                        }

                        optionsToFetch[key] = options.headers[key];
                    }
                }

                if(options.method !== undefined) {
                    if(typeof options.method !== 'string') {
                        plugin.log(`Method must be a string`);
                    }

                    if(!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
                        plugin.log(`Method must be one of GET, POST, PUT, DELETE, PATCH`);
                        promise.reject(context!.undefined);
                        return promise.handle;
                    }

                    optionsToFetch.method = options.method;
                }

                if(options.body !== undefined) {
                    if(typeof options.body !== 'string') {
                        plugin.log(`Body must be a string`);
                    }

                    optionsToFetch.body = options.body;
                }
            }

            plugin.log(`Fetching ${url}`);

            fetch(url, optionsToFetch).then(async (response) => {
                const text = await response.text();
                promise.resolve(context!.newString(text));
                plugin.log(`Fetched ${url}`);
            }).catch((error) => {
                plugin.log(`Error fetching ${url}`);
                promise.reject(context!.undefined);
            });

            promise.settled.then(context!.runtime.executePendingJobs);

            return promise.handle;
        }));
    }

}
