import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {usePlayerStore} from "@/stores/player";

export class ChangeCurrentSlideApiFeature extends PlayerPluginApiFeature {
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
