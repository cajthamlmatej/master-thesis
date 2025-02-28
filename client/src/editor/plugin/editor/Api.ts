import {QuickJSContext} from "quickjs-emscripten";
import {generateUUID} from "@/utils/Generators";
import {EditorPlugin} from "@/editor/plugin/editor/EditorPlugin";
import {PluginContext} from "@/editor/plugin/PluginContext";
import Editor from "@/editor/Editor";
import {LogApiFeature} from "@/editor/plugin/editor/api/Log";
import {EditorApiFeature} from "@/editor/plugin/editor/api/Editor";
import {FetchApiFeature} from "@/editor/plugin/editor/api/Fetch";
import {EventsApiFeature} from "@/editor/plugin/editor/api/editor/Events";
import {PluginManager} from "@/editor/plugin/PluginManager";
import {CacheApiFeature} from "@/editor/plugin/editor/api/Cache";

export interface ApiData {
    context: QuickJSContext;
    editorPlugin: EditorPlugin;
    plugin: PluginContext;
    editor: Editor;
    pluginManager: PluginManager;
}

export class Api {

    public register(data: ApiData) {
        const context = data.context;

        const api = context.newObject();

        (new LogApiFeature()).register(api, data);
        (new EditorApiFeature()).register(api, data);
        (new FetchApiFeature()).register(api, data);
        (new CacheApiFeature()).register(api, data);

        context.setProp(context.global, "api", api);
    }

}
