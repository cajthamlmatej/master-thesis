import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {usePlayerStore} from "@/stores/player";

/**
 * Provides an API feature to change the current active slide.
 */
export class ChangeCurrentSlideApiFeature extends PlayerPluginApiFeature {
    /**
     * Registers the `changeCurrentSlide` method to the provided QuickJS object.
     * 
     * @param obj - The QuickJS object to which the method is added.
     * @param data - The API data containing context, plugin, and player information.
     */
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const player = data.player;

        const playerStore = usePlayerStore();

        context.setProp(obj, "changeCurrentSlide", context.newFunction("changeCurrentSlide", (data) => {
            const parsedData = context!.dump(data)

            const slide = playerStore.getSlideById(parsedData);

            if (!slide) {
                plugin.log(`Cannot find slide with id ${parsedData}`);
                return;
            }

            playerStore.changeSlide(parsedData);
            return;
        }));
    }

}
