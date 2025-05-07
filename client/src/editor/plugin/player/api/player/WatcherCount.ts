import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {usePlayerStore} from "@/stores/player";
import {communicator} from "@/api/websockets";

/**
 * Provides an API feature to retrieve the current watcher count.
 */
export class WatcherCountApiFeature extends PlayerPluginApiFeature {
    /**
     * Registers the `getWatcherCount` method to the provided QuickJS object.
     * 
     * @param obj - The QuickJS object to which the method is added.
     * @param data - The API data containing context, plugin, and player information.
     */
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const player = data.player;

        const playerStore = usePlayerStore();

        context.setProp(obj, "getWatcherCount", context.newFunction("getWatcherCount", () => {
            return context.newNumber(communicator.getPlayerRoom()?.getWatcherCount() ?? 0);
        }));
    }

}
