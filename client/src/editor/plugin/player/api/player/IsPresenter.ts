import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {communicator} from "@/api/websockets";

/**
 * Provides an API feature to check if the current user is the presenter.
 */
export class IsPresenterApiFeature extends PlayerPluginApiFeature {
    /**
     * Registers the `isPresenter` method to the provided QuickJS object.
     * 
     * @param obj - The QuickJS object to which the method is added.
     * @param data - The API data containing context, plugin, and player information.
     */
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const player = data.player;

        context.setProp(obj, "isPresenter", context.newFunction("isPresenter", () => {
            const playerRoom = communicator.getPlayerRoom();
            if (!playerRoom) {
                return context.false;
            }

            return playerRoom.isPresenter ? context.true : context.false;
        }));
    }

}
