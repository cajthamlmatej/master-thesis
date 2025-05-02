import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerPluginEvent} from "@/editor/plugin/player/PlayerPluginEvent";

/**
 * Provides an API feature to register event listeners for player events.
 */
export class EventsApiFeature extends PlayerPluginApiFeature {
    /**
     * Registers the `on` method to the provided QuickJS object.
     * 
     * @param obj - The QuickJS object to which the method is added.
     * @param data - The API data containing context, plugin, and player information.
     */
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const playerPlugin = data.playerPlugin;
        const plugin = data.plugin;

        context.setProp(obj, "on", context.newFunction("on", (typeRaw, fncRaw) => {
            const type = context!.dump(typeRaw);
            const fnc = context!.dump(fncRaw);

            if (typeof type !== "string") {
                plugin.log("Event type must be a string");
                throw new Error("Event type must be a string");
            }

            const values = Object.values(PlayerPluginEvent) as string[];
            if (values.indexOf(type) === -1) {
                plugin.log(`Event type not found: ${type}`);
                throw new Error("Event type not found");
            }

            const typeEnum = type as PlayerPluginEvent;

            playerPlugin.registerCallback(typeEnum, fnc);

            return context.undefined;
        }));
    }

}
