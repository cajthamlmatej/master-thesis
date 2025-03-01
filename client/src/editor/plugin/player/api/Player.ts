
import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {EventsApiFeature} from "@/editor/plugin/player/api/player/Events";
import {AddBlockApiFeature} from "@/editor/plugin/player/api/player/AddBlock";
import {GetBlocksApiFeature} from "@/editor/plugin/player/api/player/GetBlocks";
import {SetModeApiFeature} from "@/editor/plugin/player/api/player/SetMode";
import {RemoveBlockApiFeature} from "@/editor/plugin/player/api/player/RemoveBlock";
import {GetModeApiFeature} from "@/editor/plugin/player/api/player/GetMode";

export class PlayerApiFeature extends PlayerPluginApiFeature {
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;

        const playerObj = context.newObject();

        (new AddBlockApiFeature()).register(playerObj, data);
        (new GetBlocksApiFeature()).register(playerObj, data);
        (new RemoveBlockApiFeature()).register(playerObj, data);

        (new SetModeApiFeature()).register(playerObj, data);
        (new GetModeApiFeature()).register(playerObj, data);

        (new EventsApiFeature()).register(playerObj, data);

        context.setProp(obj, "player", playerObj);
    }

}
