import {QuickJSHandle} from "quickjs-emscripten";
import {generateUUID} from "@/utils/Generators";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";
import {usePlayerStore} from "@/stores/player";

export class GetCurrentSlideApiFeature extends PlayerPluginApiFeature {
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;

        const playerStore = usePlayerStore();

        context.setProp(obj, "getCurrentSlide", context.newFunction("getCurrentSlide", () => {
            return context.newString(playerStore.getActiveSlide()?.id ?? "");
        }));
    }

}
