import {QuickJSHandle} from "quickjs-emscripten";
import {PlayerPluginApiData} from "@/editor/plugin/player/PlayerPluginApi";

/**
 * Abstract class representing a feature that can be registered to the PlayerPlugin API.
 */
export abstract class PlayerPluginApiFeature {
    /**
     * Registers the feature to the PlayerPlugin API.
     * 
     * @param obj - The QuickJSHandle object representing the API.
     * @param data - The data required for the API registration.
     */
    abstract register(obj: QuickJSHandle, data: PlayerPluginApiData): void;
}
