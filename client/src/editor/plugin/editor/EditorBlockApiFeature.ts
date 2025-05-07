import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlock} from "@/editor/block/EditorBlock";

/**
 * Abstract class representing a feature of an editor block's API.
 */
export abstract class EditorBlockApiFeature {
    /**
     * Registers the API feature for a specific editor block.
     * 
     * @param obj - The QuickJS object handle to register the feature on.
     * @param data - The data required for the API feature registration.
     * @param block - The editor block associated with the feature.
     */
    abstract register(obj: QuickJSHandle, data: EditorPluginApiData, block: EditorBlock): void;
}
