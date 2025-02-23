import {QuickJSHandle} from "quickjs-emscripten";
import {ApiData} from "@/editor/plugin/editor/Api";

export abstract class ApiFeature {
    abstract register(obj: QuickJSHandle, data: ApiData): void;
}
