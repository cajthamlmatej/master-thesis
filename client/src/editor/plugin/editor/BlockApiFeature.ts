import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";
import {EditorBlock} from "@/editor/block/EditorBlock";

export abstract class BlockApiFeature {
    abstract register(obj: QuickJSHandle, data: ApiData, block: EditorBlock): void;
}
