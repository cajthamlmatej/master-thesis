import Editor from "@/editor/Editor";
import {PluginContext} from "@/editor/plugin/PluginContext";
import {PluginEditorPanel} from "@/editor/plugin/PluginEditorPanel";
import Event from "@/utils/Event";
import {PluginCache} from "@/editor/plugin/PluginCache";
import Player from "@/editor/player/Player";

export class PluginManager {
    public static readonly CURRENT_MANIFEST_VERSION = 1;

    private plugins: PluginContext[] = [];
    private disabledPlugins: PluginContext[] = [];
    public PLUGIN_LOADED = new Event();
    public readonly cache = new PluginCache();

    public async loadPlugin(plugin: PluginContext) {
        console.log("[PluginManager] Loading plugin " + plugin.toString());

        const pluginManifest = plugin.getManifestVersion();

        if(PluginManager.CURRENT_MANIFEST_VERSION !== pluginManifest) {
            console.error(`[PluginManager] Plugin ${plugin.toString()} was created for older manifest version, skipping. Current version: ${PluginManager.CURRENT_MANIFEST_VERSION}, plugin version: ${pluginManifest}`);
            this.disabledPlugins.push(plugin);
            return;
        }

        if(this.plugins.find(p => p.getId() === plugin.getId())) {
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

    public async changeEditor(editor: Editor) {
        for(const plugin of this.plugins) {
            const editorPlugin = plugin.getEditorPlugin();

            if(editorPlugin) {
                await editorPlugin.loadForEditor(editor);
            }
        }
    }
    public async changePlayer(player: Player) {
        for(const plugin of this.plugins) {
            const playerPlugin = plugin.getPlayerPlugin();

            if(playerPlugin) {
                await playerPlugin.loadForPlayer(player);
            }
        }
    }

    public async getEditorPanels() {
        const plugins = this.plugins.filter(plugin => plugin.getEditorPlugin());

        let panels: PluginEditorPanel[] = [];

        for(const plugin of plugins) {
            const editorPlugin = plugin.getEditorPlugin();
            try {
                const panel = await editorPlugin!.getPanel();

                if(panel) {
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

        if(index === -1) {
            throw new Error("Plugin not found");
        }

        this.plugins.splice(index, 1);
    }

    getPlugin(pluginId: string) {
        return this.plugins.find(p => p.getId() === pluginId);
    }

    getDisabledPlugins() {
        return this.disabledPlugins;
    }
}
