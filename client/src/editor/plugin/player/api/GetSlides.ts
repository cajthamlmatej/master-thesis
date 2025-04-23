import {QuickJSHandle} from "quickjs-emscripten";
import {generateUUID} from "@/utils/Generators";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {usePlayerStore} from "@/stores/player";
import {PluginApiFeature} from "@/editor/plugin/player/api/Plugin";

export class GetSlidesApiFeature extends PluginApiFeature {
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;

        const playerStore = usePlayerStore();

        context.setProp(obj, "getSlides", context.newFunction("getSlides", () => {
            const slides = playerStore.getSlides();

            const list = context.newArray();

            let i = 0;
            for(let slide of slides) {
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
