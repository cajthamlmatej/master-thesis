import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {generateUUID} from "@/utils/Generators";
import {translation} from "@/translation/Translation";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerPluginApiFeature} from "@/editor/plugin/player/PlayerPluginApiFeature";

export class LanguageApiFeature extends PlayerPluginApiFeature {
    register(obj: QuickJSHandle, data: PlayerPluginApiData): void {
        const context = data.context;
        const language = translation.getLanguageIdentifier();

        context.setProp(obj, "language", context.newString(language));
    }

}
