import {PluginContext} from "@/editor/plugin/PluginContext";
import {PluginEditorPanel} from "@/editor/plugin/PluginEditorPanel";
import Event from "@/utils/Event";
import {PluginCache} from "@/editor/plugin/PluginCache";
import {toRaw} from "vue";
import Plugin from "@/models/Plugin";
import {PluginCustomBlock} from "./PluginCustomBlock";

export class PluginManager {
    public static readonly CURRENT_MANIFEST_VERSION = 1;
    public PLUGIN_LOADED = new Event();
    public cache = new PluginCache();
    public debugPlugin: Plugin | undefined = undefined;
    public customBlocks: PluginCustomBlock[] = [];
    private plugins: PluginContext[] = [];
    private disabledPlugins: PluginContext[] = [];

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

    public isActive(pluginId: string) {
        return this.plugins.find(p => p.getId() === pluginId) !== undefined;
    }

    public getPlugins() {
        return this.plugins;
    }

    public setDebugPlugin(plugin: Plugin) {
        this.debugPlugin = plugin;
    }

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

    public removePlugin(id: string) {
        const index = this.plugins.findIndex(p => p.getId() === id);

        if (index === -1) {
            throw new Error("Plugin not found");
        }

        this.plugins.splice(index, 1);
    }

    getPlugin(pluginId: string) {
        return this.getPlugins().find(p => p.getId() === pluginId);
    }

    getDisabledPlugins() {
        return this.disabledPlugins;
    }

    clear(cache: boolean = false) {
        this.plugins = [];
        this.disabledPlugins = [];
        this.customBlocks = [];

        if (cache) {
            this.cache.clear();
        }
    }

    public registerCustomBlock(data: PluginCustomBlock) {
        if (this.customBlocks.find(b => b.pluginId === data.pluginId && b.id === data.id)) {
            console.warn(`[PluginManager] Custom block ${data.id} already registered for plugin ${data.pluginId}, skipping`);
            return;
        }

        this.customBlocks.push(data);
        console.log(`[PluginManager] Registered custom block ${data.id} for plugin ${data.pluginId}`);
    }

    public getCustomBlocks() {
        return this.customBlocks;
    }
}
