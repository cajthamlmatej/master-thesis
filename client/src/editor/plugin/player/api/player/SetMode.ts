import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {generateUUID} from "@/utils/Generators";
import {EditorMode} from "@/editor/EditorMode";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerMode} from "@/editor/player/PlayerMode";

export class SetModeApiFeature extends PlayerPluginApiFeature {
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const player = data.player;

        context.setProp(obj, "setMode", context.newFunction("setMode", (data) => {
            const type = context!.dump(data);

            if(!(type in Object.keys(PlayerMode))) {
                plugin.log(`Invalid mode ${type}`);
                return context!.undefined;
            }

            player.changeMode(type as PlayerMode);
            return context!.undefined;
        }));
    }

}
