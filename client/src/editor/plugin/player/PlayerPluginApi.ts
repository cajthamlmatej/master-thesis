import {QuickJSContext} from "quickjs-emscripten";
import {PluginContext} from "@/editor/plugin/PluginContext";
import {PluginManager} from "@/editor/plugin/PluginManager";
import Player from "@/editor/player/Player";
import {PlayerPlugin} from "@/editor/plugin/player/PlayerPlugin";
import {LogApiFeature} from "@/editor/plugin/player/api/Log";
import {FetchApiFeature} from "@/editor/plugin/player/api/Fetch";
import {CacheApiFeature} from "@/editor/plugin/player/api/Cache";
import {LanguageApiFeature} from "@/editor/plugin/player/api/Language";
import {PluginApiFeature} from "@/editor/plugin/player/api/Plugin";
import {PlayerApiFeature} from "@/editor/plugin/player/api/Player";
import {GetSlidesApiFeature} from "@/editor/plugin/player/api/GetSlides";

/**
 * Data required to register features to the PlayerPlugin API.
 */
export interface PlayerPluginApiData {
    /**
     * The QuickJS context.
     */
    context: QuickJSContext;

    /**
     * The PlayerPlugin instance.
     */
    playerPlugin: PlayerPlugin;

    /**
     * The plugin context.
     */
    plugin: PluginContext;

    /**
     * The Player instance.
     */
    player: Player;

    /**
     * The PluginManager instance.
     */
    pluginManager: PluginManager;
}

/**
 * Class responsible for managing the PlayerPlugin API and registering features.
 */
export class PlayerPluginApi {

    /**
     * Registers all API features to the PlayerPlugin API.
     * 
     * @param data - The data required for API registration.
     */
    public register(data: PlayerPluginApiData) {
        const context = data.context;

        const api = context.newObject();

        (new LogApiFeature()).register(api, data);
        (new FetchApiFeature()).register(api, data);
        (new CacheApiFeature()).register(api, data);
        (new LanguageApiFeature()).register(api, data);
        (new PluginApiFeature()).register(api, data);

        (new PlayerApiFeature()).register(api, data);

        (new GetSlidesApiFeature()).register(api, data);

        context.setProp(context.global, "api", api);
    }

}
