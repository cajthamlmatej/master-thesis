import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {useEditorStore} from "@/stores/editor";

/**
 * Provides the "setSize" API feature for the editor plugin.
 * This feature allows resizing the editor canvas.
 */
export class SetSizeApiFeature extends EditorPluginApiFeature {
    /**
     * Registers the "setSize" function in the plugin API.
     * 
     * @param obj - The QuickJS object to which the function is added.
     * @param data - The API data containing context, plugin, and editor references.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        const editorStore = useEditorStore();

        context.setProp(obj, "setSize", context.newFunction("setSize", (widthData: QuickJSHandle, heightData: QuickJSHandle, resizeToFit: QuickJSHandle) => {
            const parsedWidthData = context.dump(widthData);
            const parsedHeightData = context.dump(heightData);
            const parsedResizeToFit = context.dump(resizeToFit);

            console.log(typeof parsedWidthData, typeof parsedHeightData, typeof parsedResizeToFit);
            if (typeof parsedWidthData !== "number" || typeof parsedHeightData !== "number" || typeof parsedResizeToFit !== "boolean") {
                plugin.log(`Invalid parameters for setSize`);
                return context.undefined;
            }

            (async () => {
                await editorStore.saveCurrentSlide()
                editor.resize(parsedWidthData, parsedHeightData, parsedResizeToFit);
                await editorStore.saveCurrentSlide()
            })();
            return context.undefined;
        }));
    }

}
