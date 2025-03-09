import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";

export abstract class PlayerPluginApiFeature {
    abstract register(obj: QuickJSHandle, data: PlayerPluginApiData): void;
}
