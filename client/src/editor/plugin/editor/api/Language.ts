import {EditorPluginApiFeature} from "@/editor/plugin/editor/EditorPluginApiFeature";
import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {generateUUID} from "@/utils/Generators";
import {translation} from "@/translation/Translation";

export class LanguageApiFeature extends EditorPluginApiFeature {
    register(obj: QuickJSHandle, data: EditorPluginApiData): void {
        const context = data.context;
        const language = translation.getLanguageIdentifier();

        context.setProp(obj, "language", context.newString(language));
    }

}
