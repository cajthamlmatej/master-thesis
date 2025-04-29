import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";

export class RemoveBlockApiFeature extends EditorPluginApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
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
