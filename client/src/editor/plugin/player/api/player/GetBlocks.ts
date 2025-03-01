import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {generateUUID} from "@/utils/Generators";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";

export class GetBlocksApiFeature extends PlayerPluginApiFeature {
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const playerPlugin = data.playerPlugin;
        const player = data.player;

        context.setProp(obj, "getBlocks", context.newFunction("getBlocks", (args) => {
            const blocks = context!.newArray();

            let i = 0;
            for (const block of player.getBlocks()) {
                const serialized = playerPlugin.serializeBlock(block);

                context!.setProp(blocks, i++, serialized);
            }

            return blocks;
        }));
    }

}
