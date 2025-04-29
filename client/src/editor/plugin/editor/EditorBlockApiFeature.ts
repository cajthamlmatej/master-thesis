import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlock} from "@/editor/block/EditorBlock";

export abstract class EditorBlockApiFeature {
    abstract register(obj: QuickJSHandle, data: EditorPluginApiData, block: EditorBlock): void;
}
