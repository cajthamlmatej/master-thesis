import {PluginManager} from "@/editor/plugin/PluginManager";
import {toRaw} from "vue";
import {PluginPlayerBlock} from "@/editor/block/base/plugin/PluginPlayerBlock";

export class PlayerPluginCommunicator {
    private pluginManager: PluginManager;

    constructor(pluginManager: PluginManager) {
        this.pluginManager = pluginManager;
    }

    async render(block: PluginPlayerBlock): Promise<string> {
        const playerPlugin = this.getPlayerPlugin(block.getPlugin());

        if (!playerPlugin) {
            return "";
        }

        return await playerPlugin.renderBlock(block);
    }

    async processMessage(block: PluginPlayerBlock, message: string) {
        const playerPlugin = this.getPlayerPlugin(block.getPlugin());

        if (!playerPlugin) {
            return "";
        }

        await playerPlugin.processBlockMessage(block, message);
    }

    public async processRemoteMessage(param: PluginPlayerBlock, message: string, clientId: string | undefined) {
        const playerPlugin = this.getPlayerPlugin(param.getPlugin());

        if (!playerPlugin) {
            return "";
        }

        await playerPlugin.processRemoteMessage(param, message, clientId);
    }

    private getPlayerPlugin(pluginId: string) {
        const plugin = this.pluginManager.getPlugin(pluginId);

        if (!plugin) {
            console.error("[PlayerPluginCommunicator] Plugin with ID " + pluginId + " not found.");
            return undefined;
        }

        const playerPlugin = toRaw(plugin.getPlayerPlugin());

        if (!playerPlugin) {
            console.error("[PlayerPluginCommunicator] Plugin with ID " + pluginId + " has no player plugin.");
            return undefined;
        }

        return playerPlugin;
    }
}
