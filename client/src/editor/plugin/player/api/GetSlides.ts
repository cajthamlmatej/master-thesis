import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {usePlayerStore} from "@/stores/player";
import {PluginApiFeature} from "@/editor/plugin/player/api/Plugin";

/**
 * Represents the GetSlides API feature that provides access to the slides in the player.
 */
export class GetSlidesApiFeature extends PluginApiFeature {
    /**
     * Registers the GetSlides API feature by setting the "getSlides" property on the provided object.
     * 
     * @param obj - The QuickJS object to which the property will be added.
     * @param data - The data containing the plugin and context information.
     */
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;

        const playerStore = usePlayerStore();

        context.setProp(obj, "getSlides", context.newFunction("getSlides", () => {
            const slides = playerStore.getSlides();

            const list = context.newArray();

            let i = 0;
            for (let slide of slides) {
                const slideObj = data.playerPlugin.serializeObject({
                    id: slide.id,
                    data: slide.data,
                    position: slide.position,
                });
                context.setProp(list, i++, slideObj);
            }

            return;
        }));
    }

}
