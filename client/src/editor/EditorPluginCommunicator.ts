import {PluginManager} from "@/editor/plugin/PluginManager";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";
import {toRaw} from "vue";

export class EditorPluginCommunicator {
    private pluginManager: PluginManager;

    constructor(pluginManager: PluginManager) {
        this.pluginManager = pluginManager;
    }

    async render(block: EditorBlock): Promise<string> {
        if (!(block instanceof PluginEditorBlock)) {
            console.error("[EditorPluginCommunicator] Block is not an instance of PluginEditorBlock and cannot be rendered.");
            return "";
        }

        const pluginId = block.getPlugin();
        const plugin = this.pluginManager.getPlugin(pluginId);

        if (!plugin) {
            console.error("[EditorPluginCommunicator] Plugin with ID " + pluginId + " not found.");
            return "";
        }

        const editorPlugin = toRaw(plugin.getEditorPlugin());

        if (!editorPlugin) {
            console.error("[EditorPluginCommunicator] Plugin with ID " + pluginId + " has no editor plugin.");
            return "";
        }

        return await editorPlugin.renderBlock(block);
    }

    async processMessage(block: PluginEditorBlock) {
        const pluginId = block.getPlugin();
        const plugin = this.pluginManager.getPlugin(pluginId);

        if (!plugin) {
            console.error("[EditorPluginCommunicator] Plugin with ID " + pluginId + " not found.");
            return;
        }

        const editorPlugin = toRaw(plugin.getEditorPlugin());

        if (!editorPlugin) {
            console.error("[EditorPluginCommunicator] Plugin with ID " + pluginId + " has no editor plugin.");
            return;
        }

        await editorPlugin.processBlockMessage(block);
    }
}
