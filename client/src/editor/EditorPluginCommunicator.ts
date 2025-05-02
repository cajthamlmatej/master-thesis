import {PluginManager} from "@/editor/plugin/PluginManager";
import {PluginEditorBlock} from "@/editor/block/base/plugin/PluginEditorBlock";
import {toRaw} from "vue";

/**
 * Class responsible for communicating with editor plugins.
 */
export class EditorPluginCommunicator {
    private pluginManager: PluginManager;

    /**
     * Creates an instance of EditorPluginCommunicator.
     * @param pluginManager - The plugin manager instance.
     */
    constructor(pluginManager: PluginManager) {
        this.pluginManager = pluginManager;
    }

    /**
     * Renders a block using the associated editor plugin.
     * @param block - The block to render.
     * @returns A promise resolving to the rendered block as a string.
     * @throws Error if the plugin is not found.
     */
    async render(block: PluginEditorBlock): Promise<string> {
        const editorPlugin = this.getEditorPlugin(block.getPlugin());

        if (!editorPlugin) {
            throw new Error("Plugin not found");
        }

        return await editorPlugin.renderBlock(block);
    }

    /**
     * Processes a message for a given block using the associated editor plugin.
     * @param block - The block to process the message for.
     * @param message - The message to process.
     * @returns A promise resolving to an empty string if the plugin is not found.
     */
    async processMessage(block: PluginEditorBlock, message: string) {
        const editorPlugin = this.getEditorPlugin(block.getPlugin());

        if (!editorPlugin) {
            return "";
        }

        await editorPlugin.processBlockMessage(block, message);
    }

    /**
     * Processes a property change for a given block using the associated editor plugin.
     * @param block - The block to process the property change for.
     * @param key - The property key that changed.
     * @returns A promise resolving to an empty string if the plugin is not found.
     */
    async processPropertyChange(block: PluginEditorBlock, key: string) {
        const editorPlugin = this.getEditorPlugin(block.getPlugin());

        if (!editorPlugin) {
            return "";
        }

        await editorPlugin.processBlockPropertyChange(block, key);
    }

    /**
     * Creates a custom block using the specified plugin.
     * @param pluginId - The ID of the plugin.
     * @param id - The ID of the custom block to create.
     * @returns A promise resolving to the created block as a string, or an empty string if the plugin is not found.
     */
    async createCustomBlock(pluginId: string, id: string): Promise<string> {
        const editorPlugin = this.getEditorPlugin(pluginId);

        if (!editorPlugin) {
            return "";
        }

        return await editorPlugin.createCustomBlock(id);
    }

    /**
     * Retrieves the editor plugin associated with the given plugin ID.
     * @param pluginId - The ID of the plugin.
     * @returns The editor plugin instance, or undefined if not found.
     */
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
