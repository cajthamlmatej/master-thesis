import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {translation} from "@/translation/Translation";

/**
 * Represents a feature for exposing the current language identifier to the plugin.
 */
export class LanguageApiFeature extends EditorPluginApiFeature {
    /**
     * Registers the current language identifier into the JavaScript context.
     * 
     * @param obj - The QuickJS object to which the `language` property will be added.
     * @param data - The data containing the plugin and context information.
     */
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const language = translation.getLanguageIdentifier();

        context.setProp(obj, "language", context.newString(language));
    }

}
