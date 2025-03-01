import {QuickJSHandle} from "quickjs-emscripten";
import {EditorPluginApiData} from "@/editor/plugin/editor/EditorPluginApi";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerBlock} from "@/editor/block/PlayerBlock";

export abstract class PlayerBlockApiFeature {
    abstract register(obj: QuickJSHandle, data: PlayerPluginApiData, block: PlayerBlock): void;
}
