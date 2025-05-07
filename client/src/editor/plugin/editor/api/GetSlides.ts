import {QuickJSHandle} from "quickjs-emscripten";
import {usePlayerStore} from "@/stores/player";
import {PluginApiFeature} from "@/editor/plugin/editor/api/Plugin";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";

/**
 * Represents a feature for retrieving slides from the player store.
 */
export class GetSlidesApiFeature extends PluginApiFeature {
    /**
     * Registers a `getSlides` function into the JavaScript context for retrieving slides.
     * 
     * @param obj - The QuickJS object to which the `getSlides` function will be added.
     * @param data - The data containing the plugin and context information.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;

        const playerStore = usePlayerStore();

        context.setProp(obj, "getSlides", context.newFunction("getSlides", () => {
            const slides = playerStore.getSlides();

            const list = context.newArray();

            let i = 0;
            for (let slide of slides) {
                const slideObj = data.editorPlugin.serializeObject({
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
