import {ApiFeature} from "@/editor/plugin/editor/ApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";
import {generateUUID} from "@/utils/Generators";

export class RemoveBlockApiFeature extends ApiFeature {
    register(obj: QuickJSHandle, data: ApiData): void {
        const context = data.context;
        const plugin = data.plugin;
        const editor = data.editor;

        context.setProp(obj, "removeBlock", context.newFunction("removeBlock", (args) => {
            const id = context!.dump(args);

            plugin.log(`Removing block ${id}`);
            try {
                editor.removeBlock(id);
            } catch (e) {
                // note(Matej): removal of the block can fail (for example current bug with text editor)
                plugin.log(`Error removing block ${id}`);
            }
            return context!.undefined;
        }));
    }

}
