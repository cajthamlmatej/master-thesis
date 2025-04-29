import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";

export abstract class EditorPluginApiFeature {
    abstract register(obj: QuickJSHandle, data: EditorPluginApiData): void;
}
