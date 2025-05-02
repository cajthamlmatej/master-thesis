import {PluginContext} from "@/editor/plugin/PluginContext";
import {PluginEditorPanel} from "@/editor/plugin/PluginEditorPanel";
import Event from "@/utils/Event";
import {PluginCache} from "@/editor/plugin/PluginCache";
import {toRaw} from "vue";
import Plugin from "@/models/Plugin";
import {PluginCustomBlock} from "./PluginCustomBlock";

/**
 * Manages the lifecycle of plugins, including loading, unloading, and managing custom blocks.
 */
export class PluginManager {
    public static readonly CURRENT_MANIFEST_VERSION = 1;

    /**
     * Event triggered when a plugin is loaded.
     */
    public PLUGIN_LOADED = new Event();

    /**
     * Cache for storing plugin-related data.
     */
    public cache = new PluginCache();

    /**
     * Debug plugin instance for testing purposes.
     */
    public debugPlugin: Plugin | undefined = undefined;

    /**
     * List of custom blocks registered by plugins.
     */
    public customBlocks: PluginCustomBlock[] = [];

    /**
     * List of active plugins.
     */
    private plugins: PluginContext[] = [];

    /**
     * List of disabled plugins due to compatibility or other issues.
     */
    private disabledPlugins: PluginContext[] = [];

    /**
     * Loads a plugin into the manager.
     * @param plugin The plugin context to load.
     * @throws If the plugin is already loaded or has an ID conflict.
     */
    public async loadPlugin(plugin: PluginContext) {
        console.log("[PluginManager] Loading plugin " + plugin.toString());

        const pluginManifest = plugin.getManifestVersion();

        if (PluginManager.CURRENT_MANIFEST_VERSION !== pluginManifest) {
            console.error(`[PluginManager] Plugin ${plugin.toString()} was created for older manifest version, skipping. Current version: ${PluginManager.CURRENT_MANIFEST_VERSION}, plugin version: ${pluginManifest}`);
            this.disabledPlugins.push(plugin);
            return;
        }

        if (this.plugins.find(p => p.getId() === plugin.getId())) {
            throw new Error("Plugin already loaded or ID conflict, cannot load plugin with ID " + plugin.getId());
        }

        this.plugins.push(plugin);

        this.PLUGIN_LOADED.emit(plugin);
    }

    /**
     * Checks if a plugin is active.
     * @param pluginId The ID of the plugin to check.
     * @returns True if the plugin is active, false otherwise.
     */
    public isActive(pluginId: string) {
        return this.plugins.find(p => p.getId() === pluginId) !== undefined;
    }

    /**
     * Retrieves the list of active plugins.
     * @returns An array of active plugin contexts.
     */
    public getPlugins() {
        return this.plugins;
    }

    /**
     * Sets the debug plugin for testing purposes.
     * @param plugin The debug plugin instance.
     */
    public setDebugPlugin(plugin: Plugin) {
        this.debugPlugin = plugin;
    }

    /**
     * Retrieves editor panels from all active plugins.
     * @returns A promise resolving to an array of plugin editor panels.
     */
    public async getEditorPanels() {
        const plugins = toRaw(this.getPlugins()).filter(plugin => plugin.getEditorPlugin());

        let panels: PluginEditorPanel[] = [];

        for (const plugin of plugins) {
            const editorPlugin = plugin.getEditorPlugin();
            try {
                const panel = await editorPlugin!.getPanel();

                if (panel) {
                    panels.push({
                        name: plugin.getName(),
                        content: panel,
                        plugin: plugin,
                        icon: plugin.getIcon()
                    });
                }
            } catch (e) {
                plugin.log(`Error while getting panel: ${e}`);
            }
        }

        return panels;
    }

    /**
     * Removes a plugin by its ID.
     * @param id The ID of the plugin to remove.
     * @throws If the plugin is not found.
     */
    public removePlugin(id: string) {
        const index = this.plugins.findIndex(p => p.getId() === id);

        if (index === -1) {
            throw new Error("Plugin not found");
        }

        this.plugins.splice(index, 1);
    }

    /**
     * Retrieves a plugin by its ID.
     * @param pluginId The ID of the plugin to retrieve.
     * @returns The plugin context if found, undefined otherwise.
     */
    getPlugin(pluginId: string) {
        return this.getPlugins().find(p => p.getId() === pluginId);
    }

    /**
     * Retrieves the list of disabled plugins.
     * @returns An array of disabled plugin contexts.
     */
    getDisabledPlugins() {
        return this.disabledPlugins;
    }

    /**
     * Clears all plugins, disabled plugins, and custom blocks.
     * Optionally clears the cache as well.
     * @param cache Whether to clear the cache.
     */
    clear(cache: boolean = false) {
        this.plugins = [];
        this.disabledPlugins = [];
        this.customBlocks = [];

        if (cache) {
            this.cache.clear();
        }
    }

    /**
     * Registers a custom block for a plugin.
     * @param data The custom block data to register.
     */
    public registerCustomBlock(data: PluginCustomBlock) {
        if (this.customBlocks.find(b => b.pluginId === data.pluginId && b.id === data.id)) {
            console.warn(`[PluginManager] Custom block ${data.id} already registered for plugin ${data.pluginId}, skipping`);
            return;
        }

        this.customBlocks.push(data);
        console.log(`[PluginManager] Registered custom block ${data.id} for plugin ${data.pluginId}`);
    }

    /**
     * Retrieves the list of registered custom blocks.
     * @returns An array of custom blocks.
     */
    public getCustomBlocks() {
        return this.customBlocks;
    }
}
