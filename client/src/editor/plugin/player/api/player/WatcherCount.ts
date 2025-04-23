import {QuickJSHandle} from "quickjs-emscripten";
import {generateUUID} from "@/utils/Generators";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {usePlayerStore} from "@/stores/player";
import {communicator} from "@/api/websockets";

export class WatcherCountApiFeature extends PlayerPluginApiFeature {
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
