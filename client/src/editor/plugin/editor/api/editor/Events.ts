import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorPluginEvent} from "@/editor/plugin/editor/EditorPluginEvent";

export class EventsApiFeature extends EditorPluginApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const editorPlugin = data.editorPlugin;
        const plugin = data.plugin;

        context.setProp(obj, "on", context.newFunction("on", (typeRaw, fncRaw) => {
            const type = context!.dump(typeRaw);
            const fnc = context!.dump(fncRaw);

            if (typeof type !== "string") {
                plugin.log("Event type must be a string");
                throw new Error("Event type must be a string");
            }

            const values = Object.values(EditorPluginEvent) as string[];
            if (values.indexOf(type) === -1) {
                plugin.log(`Event type not found: ${type}`);
                throw new Error("Event type not found");
            }

            const typeEnum = type as EditorPluginEvent;

            editorPlugin.registerCallback(typeEnum, fnc);

            return context.undefined;
        }));
    }

}
