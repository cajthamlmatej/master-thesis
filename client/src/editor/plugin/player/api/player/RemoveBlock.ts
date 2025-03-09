import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";

export class RemoveBlockApiFeature extends PlayerPluginApiFeature {
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const player = data.player;

        context.setProp(obj, "removeBlock", context.newFunction("removeBlock", (args) => {
            const id = context!.dump(args);

            plugin.log(`Removing block ${id}`);
            try {
                player.removeBlock(id);
            } catch (e) {
                // note(Matej): removal of the block can fail (for example current bug with text editor)
                plugin.log(`Error removing block ${id}`);
            }
            return context!.undefined;
        }));
    }

}
