import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {communicator} from "@/api/websockets";

export class IsPresenterApiFeature extends PlayerPluginApiFeature {
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
