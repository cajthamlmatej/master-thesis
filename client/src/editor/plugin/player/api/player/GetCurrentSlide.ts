import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {usePlayerStore} from "@/stores/player";

/**
 * Provides an API feature to retrieve the current active slide.
 */
export class GetCurrentSlideApiFeature extends PlayerPluginApiFeature {
    /**
     * Registers the `getCurrentSlide` method to the provided QuickJS object.
     * 
     * @param obj - The QuickJS object to which the method is added.
     * @param data - The API data containing context, plugin, and player information.
     */
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;

        const playerStore = usePlayerStore();

        context.setProp(obj, "getCurrentSlide", context.newFunction("getCurrentSlide", () => {
            return context.newString(playerStore.getActiveSlide()?.id ?? "");
        }));
    }

}
