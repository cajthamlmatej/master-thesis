import {QuickJSContext} from "quickjs-emscripten";
import {EditorPlugin} from "@/editor/plugin/editor/EditorPlugin";
import {PluginContext} from "@/editor/plugin/PluginContext";
import Editor from "@/editor/Editor";
import {LogApiFeature} from "@/editor/plugin/editor/api/Log";
import {EditorApiFeature} from "@/editor/plugin/editor/api/Editor";
import {FetchApiFeature} from "@/editor/plugin/editor/api/Fetch";
import {PluginManager} from "@/editor/plugin/PluginManager";
import {CacheApiFeature} from "@/editor/plugin/editor/api/Cache";
import {LanguageApiFeature} from "@/editor/plugin/editor/api/Language";
import {PluginApiFeature} from "@/editor/plugin/editor/api/Plugin";
import {GetSlidesApiFeature} from "@/editor/plugin/editor/api/GetSlides";

export interface EditorPluginApiData {
    context: QuickJSContext;
    editorPlugin: EditorPlugin;
    plugin: PluginContext;
    editor: Editor;
    pluginManager: PluginManager;
}

/**
 * Represents the API for editor plugins, providing various features and utilities.
 */
export class EditorPluginApi {

    /**
     * Registers all available API features with the provided data.
     * 
     * @param data - The data required to initialize and register API features.
     */
    public register(data: EditorPluginApiData) {
        const context = data.context;

        const api = context.newObject();

        (new LogApiFeature()).register(api, data);
        (new EditorApiFeature()).register(api, data);
        (new FetchApiFeature()).register(api, data);
        (new CacheApiFeature()).register(api, data);

        (new LanguageApiFeature()).register(api, data);
        (new PluginApiFeature()).register(api, data);

        (new GetSlidesApiFeature()).register(api, data);

        context.setProp(context.global, "api", api);
    }

}
