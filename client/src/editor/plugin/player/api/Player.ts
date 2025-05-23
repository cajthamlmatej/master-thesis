import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {EventsApiFeature} from "@/editor/plugin/player/api/player/Events";
import {AddBlockApiFeature} from "@/editor/plugin/player/api/player/AddBlock";
import {GetBlocksApiFeature} from "@/editor/plugin/player/api/player/GetBlocks";
import {SetModeApiFeature} from "@/editor/plugin/player/api/player/SetMode";
import {RemoveBlockApiFeature} from "@/editor/plugin/player/api/player/RemoveBlock";
import {GetModeApiFeature} from "@/editor/plugin/player/api/player/GetMode";
import {IsPresenterApiFeature} from "@/editor/plugin/player/api/player/IsPresenter";
import {ChangeCurrentSlideApiFeature} from "@/editor/plugin/player/api/player/ChangeCurrentSlide";
import {WatcherCountApiFeature} from "@/editor/plugin/player/api/player/WatcherCount";
import {GetCurrentSlideApiFeature} from "@/editor/plugin/player/api/player/GetCurrentSlide";

/**
 * Represents the Player API feature that provides various functionalities for interacting with the player.
 */
export class PlayerApiFeature extends PlayerPluginApiFeature {
    /**
     * Registers the Player API feature by setting the "player" property on the provided object.
     * 
     * @param obj - The QuickJS object to which the property will be added.
     * @param data - The data containing the plugin and context information.
     */
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;

        const playerObj = context.newObject();

        (new AddBlockApiFeature()).register(playerObj, data);
        (new GetBlocksApiFeature()).register(playerObj, data);
        (new RemoveBlockApiFeature()).register(playerObj, data);

        (new SetModeApiFeature()).register(playerObj, data);
        (new GetModeApiFeature()).register(playerObj, data);

        (new EventsApiFeature()).register(playerObj, data);

        (new IsPresenterApiFeature()).register(playerObj, data);
        (new WatcherCountApiFeature()).register(playerObj, data);

        (new ChangeCurrentSlideApiFeature()).register(playerObj, data);
        (new GetCurrentSlideApiFeature()).register(playerObj, data);

        context.setProp(obj, "player", playerObj);
    }

}
