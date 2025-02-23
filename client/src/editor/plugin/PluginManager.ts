import Editor from "@/editor/Editor";
import {PluginContext} from "@/editor/plugin/PluginContext";
import {PluginEditorPanel} from "@/editor/plugin/PluginEditorPanel";
import Event from "@/utils/Event";

export class PluginManager {
    private plugins: PluginContext[] = [];
    public PLUGIN_LOADED = new Event();

    public async loadPlugin(plugin: PluginContext) {
        console.log("[PluginManager] Loading plugin " + plugin.toString());

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

    public async getEditorPanels() {
        const plugins = this.plugins.filter(plugin => plugin.getEditorPlugin());

        let panels: PluginEditorPanel[] = [];

        for(const plugin of plugins) {
            const editorPlugin = plugin.getEditorPlugin();
            const panel = await editorPlugin!.getPanel();

            if(panel) {
                panels.push({
                    name: plugin.getName(),
                    content: panel,
                    plugin: plugin,
                    icon: plugin.getIcon()
                });
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
}
