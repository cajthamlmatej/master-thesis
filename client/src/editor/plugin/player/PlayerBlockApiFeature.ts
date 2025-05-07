import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";
import {PlayerBlock} from "@/editor/block/PlayerBlock";

/**
 * Abstract class representing a feature that can be registered to a PlayerBlock API.
 */
export abstract class PlayerBlockApiFeature {
    /**
     * Registers the feature to the PlayerBlock API.
     * 
     * @param obj - The QuickJSHandle object representing the API.
     * @param data - The data required for the API registration.
     * @param block - The PlayerBlock instance to which the feature is being registered.
     */
    abstract register(obj: QuickJSHandle, data: PlayerPluginApiData, block: PlayerBlock): void;
}
