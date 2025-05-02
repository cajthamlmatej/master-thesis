import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";

/**
 * Abstract class representing a feature of the editor plugin API.
 */
export abstract class EditorPluginApiFeature {
    /**
     * Registers the API feature with the given context and data.
     * 
     * @param obj - The QuickJS object handle to register the feature on.
     * @param data - The data required for the API feature registration.
     */
    abstract register(obj: QuickJSHandle, data: EditorPluginApiData): void;
}
