import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";

export abstract class PlayerPluginApiFeature {
    abstract register(obj: QuickJSHandle, data: PlayerPluginApiData): void;
}
