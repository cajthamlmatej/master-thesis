import {PluginManager} from "@/editor/plugin/PluginManager";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";
import {toRaw} from "vue";

export class EditorPluginCommunicator {
    private pluginManager: PluginManager;

    constructor(pluginManager: PluginManager) {
        this.pluginManager = pluginManager;
    }

    async render(block: PluginEditorBlock): Promise<string> {
        const editorPlugin = this.getEditorPlugin(block.getPlugin());

        if (!editorPlugin) {
            throw new Error("Plugin not found");
        }

        return await editorPlugin.renderBlock(block);
    }

    async processMessage(block: PluginEditorBlock, message: string) {
        const editorPlugin = this.getEditorPlugin(block.getPlugin());

        if (!editorPlugin) {
            return "";
        }

        await editorPlugin.processBlockMessage(block, message);
    }

    async processPropertyChange(block: PluginEditorBlock, key: string) {
        const editorPlugin = this.getEditorPlugin(block.getPlugin());

        if (!editorPlugin) {
            return "";
        }

        await editorPlugin.processBlockPropertyChange(block, key);
    }

    private getEditorPlugin(pluginId: string) {
        const plugin = toRaw(this.pluginManager).getPlugin(pluginId);

        if (!plugin) {
            console.error("[EditorPluginCommunicator] Plugin with ID " + pluginId + " not found.");
            return undefined;
        }

        const editorPlugin = toRaw(plugin.getEditorPlugin());

        if (!editorPlugin) {
            console.error("[EditorPluginCommunicator] Plugin with ID " + pluginId + " has no editor plugin.");
            return undefined;
        }

        return editorPlugin;
    }
}
