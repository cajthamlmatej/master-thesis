import {PluginContext} from '../PluginContext';
import {load} from "@/editor/plugin/quickjs/QuickJSRunner";
import {QuickJSContext, QuickJSHandle} from "quickjs-emscripten";
import {usePluginStore} from "@/stores/plugin";
import {PluginManager} from "@/editor/plugin/PluginManager";
import Player from "@/editor/player/Player";
import {PlayerBlock} from "@/editor/block/PlayerBlock";
import {PluginPlayerBlock} from "@/editor/block/base/plugin/PluginPlayerBlock";
import {PlayerPluginEvent} from "@/editor/plugin/player/PlayerPluginEvent";
import {PlayerPluginApi} from "@/editor/plugin/player/PlayerPluginApi";

/**
 * Class representing a plugin for the player, managing its lifecycle and interactions.
 */
export class PlayerPlugin {
    private plugin: PluginContext;
    private code: string;

    private player: Player | undefined;
    private context: QuickJSContext | undefined;

    private baseEvaluation: QuickJSHandle;

    private loadedResolve: (value: void) => void;
    public loadedPromise = new Promise<void>((resolve) => {
        this.loadedResolve = resolve;
    });

    private callbacks: Record<PlayerPluginEvent, QuickJSHandle | undefined> = {
        [PlayerPluginEvent.PLUGIN_BLOCK_RENDER]: undefined,
        [PlayerPluginEvent.PLUGIN_BLOCK_MESSAGE]: undefined,
        [PlayerPluginEvent.PLUGIN_REMOTE_MESSAGE]: undefined
    };
    private api: PlayerPluginApi = new PlayerPluginApi();

    constructor(plugin: PluginContext, code: string, player?: Player) {
        this.plugin = plugin;
        this.code = code;

        if (player) this.player = player;

        this.prepareContext();
    }

    /**
     * Registers a callback function for a specific event.
     * 
     * @param name - The name of the event.
     * @param fnc - The QuickJSHandle function to register as a callback.
     */
    public registerCallback(name: PlayerPluginEvent, fnc: QuickJSHandle) {
        if (!this.context) throw new Error("Context not ready");

        try {
            const evalFnc = this.context.evalCode(`(${fnc})`, "event.js");
            const result = this.context.unwrapResult(evalFnc);

            if (!result) {
                this.plugin.log(`Error while registering function ${name}: ${evalFnc}`);
                return;
            }

            this.callbacks[name] = result;
        } catch (e) {
            this.plugin.log(`Error while registering function ${name}: ${e}`);
        }
    }

    /**
     * Calls a registered event callback with the provided arguments.
     * 
     * @param name - The name of the event.
     * @param args - The arguments to pass to the callback.
     * @returns The result of the callback execution.
     */
    public async callEvent(name: PlayerPluginEvent, ...args: QuickJSHandle[]) {
        if (!this.context) throw new Error("Context not ready");

        const fnc = this.callbacks[name];

        if (!fnc) {
            console.debug(`Event ${name} not registered`);
            return;
        }

        return this.context.callFunction(fnc, this.context.undefined, ...args);
    }

    /**
     * Serializes any value into a QuickJSHandle.
     * 
     * @param value - The value to serialize.
     * @returns The serialized QuickJSHandle.
     */
    public serializeAny(value: any): QuickJSHandle {
        if (!this.context) throw new Error("Context not ready");

        if (value === null || value === undefined) return this.context!.undefined;

        if (typeof value === "string") {
            return this.context!.newString(value);
        } else if (typeof value === "number") {
            return this.context!.newNumber(value);
        } else if (typeof value === "boolean") {
            return value ? this.context!.true : this.context!.false;
        } else if (typeof value === "object") {
            return this.serializeObject(value);
        } else if (!value) {
            return this.context!.undefined;
        } else {
            throw new Error(`Unsupported type for serialization: ${typeof value}`);
        }
    }

    /**
     * Serializes an object into a QuickJSHandle.
     * 
     * @param value - The object to serialize.
     * @param object - An optional existing QuickJSHandle object to populate.
     * @returns The serialized QuickJSHandle.
     */
    public serializeObject(value: any, object?: QuickJSHandle): QuickJSHandle {
        if (!this.context) throw new Error("Context not ready");

        if (!object) {
            object = this.context.newObject();
        }

        for (const key in value) {
            this.context.setProp(object, key, this.serializeAny(value[key]));
        }

        return object;
    }

    /**
     * Serializes a PlayerBlock into a QuickJSHandle.
     * 
     * @param block - The PlayerBlock to serialize.
     * @returns The serialized QuickJSHandle.
     */
    public serializeBlock(block: PlayerBlock): QuickJSHandle {
        const base = this.serializeAny(block.serialize());

        const data = {
            context: this.context!,
            playerPlugin: this,
            player: this.player!,
            plugin: this.plugin,
            pluginManager: usePluginStore().manager as PluginManager
        };

        const blockApiFeatures = block.getApiFeatures();

        for (const feature of blockApiFeatures) {
            const newFeature = new feature.apiFeature();
            newFeature.register(base, data, block);
        }

        return base;
    }

    /**
     * Loads the plugin for a specific player.
     * 
     * @param player - The Player instance.
     */
    public async loadForPlayer(player: Player) {
        this.player = player;
        this.setupContext();

        this.plugin.log(`Successfully loaded for player`);
    }

    /**
     * Renders a PlayerBlock by calling the appropriate event.
     * 
     * @param block - The PlayerBlock to render.
     * @returns The rendered block as a string.
     */
    public async renderBlock(block: PlayerBlock) {
        await this.loadedPromise;
        const serializedBlock = this.serializeBlock(block);

        const result = await this.callEvent(PlayerPluginEvent.PLUGIN_BLOCK_RENDER, serializedBlock);

        if (!result) return "";

        return this.context!.dump(result.unwrap());
    }

    /**
     * Processes a message sent to a block.
     * 
     * @param block - The PluginPlayerBlock receiving the message.
     * @param message - The message to process.
     * @returns The result of the message processing.
     */
    async processBlockMessage(block: PluginPlayerBlock, message: string) {
        await this.loadedPromise;
        const serializedBlock = this.serializeBlock(block);

        try {
            const result = await this.callEvent(PlayerPluginEvent.PLUGIN_BLOCK_MESSAGE, serializedBlock, this.context!.newString(message));

            if (!result) return "";

            return this.context!.dump(result.unwrap());
        } catch (e) {
            console.error(e);
            return undefined;
        }
    }

    /**
     * Processes a remote message sent to a block.
     * 
     * @param block - The PluginPlayerBlock receiving the message.
     * @param message - The message to process.
     * @param clientId - The client ID sending the message, if applicable.
     * @returns The result of the message processing.
     */
    async processRemoteMessage(block: PluginPlayerBlock, message: string, clientId: string | undefined) {
        await this.loadedPromise;
        const serializedBlock = this.serializeBlock(block);

        try {
            const result = await this.callEvent(PlayerPluginEvent.PLUGIN_REMOTE_MESSAGE,
                serializedBlock,
                this.context!.newString(message),
                clientId ? this.context!.newString(clientId) : this.context!.undefined);

            if (!result) return "";

            return this.context!.dump(result.unwrap());
        } catch (e) {
            console.error(e);
            return undefined;
        }
    }

    /**
     * Prepares the QuickJS context for the plugin.
     */
    private async prepareContext() {
        const QuickJS = await load();
        this.context = QuickJS.newContext();

        const result = this.context.evalCode(this.code, "player.js", {type: "module"});

        this.baseEvaluation = this.context.unwrapResult(result);

        this.setupContext();
        await this.callFunctionIfExists("initPlayer");
        this.loadedResolve();
        this.player?.redrawBlocks();
    }

    /**
     * Sets up the QuickJS context with the necessary API and data.
     */
    private setupContext() {
        if (!this.context || !this.player) {
            console.error("Context or player not ready, cannot setup context");
            return;
        }

        this.api.register({
            context: this.context,
            player: this.player,
            playerPlugin: this,
            plugin: this.plugin,
            pluginManager: usePluginStore().manager as PluginManager
        });

        this.plugin.log(`Prepared context`);
    }

    /**
     * Calls a function in the QuickJS context if it exists.
     * 
     * @param name - The name of the function to call.
     * @param args - The arguments to pass to the function.
     * @returns The result of the function call.
     */
    private async callFunctionIfExists(name: string, ...args: QuickJSHandle[]) {
        if (!this.context) throw new Error("Context not ready");

        const fnc = this.context.getProp(this.baseEvaluation, name);

        if (!fnc) {
            return;
        }

        const dump = this.context.dump(fnc);

        if (!dump) {
            return;
        }

        try {
            return this.context.callFunction(fnc, this.context.undefined, ...args);
        } catch (e) {
            this.plugin.log(`Error while calling function ${name}: ${e}`);
        }

        return;
    }
}
