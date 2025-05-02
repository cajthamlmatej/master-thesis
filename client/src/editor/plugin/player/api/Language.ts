import {QuickJSHandle} from "quickjs-emscripten";
import {translation} from "@/translation/Translation";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";

/**
 * Represents the Language API feature that provides the current language identifier.
 */
export class LanguageApiFeature extends PlayerPluginApiFeature {
    /**
     * Registers the Language API feature by setting the "language" property on the provided object.
     * 
     * @param obj - The QuickJS object to which the property will be added.
     * @param data - The data containing the plugin and context information.
     */
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const language = translation.getLanguageIdentifier();

        context.setProp(obj, "language", context.newString(language));
    }

}
