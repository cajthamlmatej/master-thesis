import {ApiFeature} from "@/editor/plugin/editor/ApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";
import {generateUUID} from "@/utils/Generators";
import {useEditorStore} from "@/stores/editor";

export class SetSizeApiFeature extends ApiFeature {
    register(obj: QuickJSHandle, data: ApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        const editorStore = useEditorStore();

        context.setProp(obj, "setSize", context.newFunction("setSize", (widthData: QuickJSHandle, heightData: QuickJSHandle, resizeToFit: QuickJSHandle) => {
            const parsedWidthData = context.dump(widthData);
            const parsedHeightData = context.dump(heightData);
            const parsedResizeToFit = context.dump(resizeToFit);

            console.log(typeof parsedWidthData, typeof parsedHeightData, typeof parsedResizeToFit);
            if(typeof parsedWidthData !== "number" || typeof parsedHeightData !== "number" || typeof parsedResizeToFit !== "boolean") {
                plugin.log(`Invalid parameters for setSize`);
                return context.undefined;
            }

            (async() => {
                await editorStore.saveCurrentSlide()
                editor.resize(parsedWidthData, parsedHeightData, parsedResizeToFit);
                await editorStore.saveCurrentSlide()
            })();
            return context.undefined;
        }));
    }

}
