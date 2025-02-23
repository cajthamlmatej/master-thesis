import {defineStore} from "pinia";
import {ref, toRaw, watch} from "vue";
import {useAuthenticationStore} from "@/stores/authentication";
import {api} from "@/api/api";
import {useUserStore} from "@/stores/user";
import Plugin, {PluginRelease} from "@/models/Plugin";
import {PluginManager} from "@/editor/plugin/PluginManager";
import PluginMapper from "@/models/mappers/PluginMapper";
import {PluginEditorPanel} from "@/editor/plugin/PluginEditorPanel";
import {useEditorStore} from "@/stores/editor";
import {useMaterialStore} from "@/stores/material";
import Material, {MaterialPlugin} from "@/models/Material";
import {PluginContext} from "@/editor/plugin/PluginContext";

export const usePluginStore = defineStore("plugin", () => {
    const plugins = ref([] as Plugin[]);

    const pluginManager = new PluginManager();
    const pluginPanels = ref<PluginEditorPanel[]>([]);

    const userStore = useUserStore();
    const editorStore = useEditorStore();
    const materialStore = useMaterialStore();

    const tags = [
        "WIDGETS",
        "CONTENT",
        "EDITOR",
        "PLAYER",
        "GAMIFICATION",
    ]

    const load = async () => {
        const response = await api.plugin.all();

        if (response === undefined) {
            return;
        }

        plugins.value = response.plugins.map((p) => PluginMapper.fromPluginDTO(p));
    };
    const loadOne = async (id: string) => {
        return (await loadMultiple([id]))?.[0];
    }
    const loadMultiple = async (ids: string[]) => {
        const response = await api.plugin.specific(ids);

        if (response === undefined) {
            return;
        }

        const newPlugins = response.plugins.map((p) => PluginMapper.fromPluginDTO(p));

        for (const plugin of newPlugins) {
            const existingPlugin = plugins.value.find((p) => p.id === plugin.id);

            if (!existingPlugin) {
                plugins.value.push(plugin);
            } else {
                Object.assign(existingPlugin, plugin);
            }
        }

        return newPlugins;
    }

    const getPanels = async () => {
        pluginPanels.value = await pluginManager.getEditorPanels();
    }

    watch(() => editorStore.getEditor(), async() => {
        const editor = editorStore.getEditor();
        if (!editor) return;

        await pluginManager.changeEditor(editor);

        await getPanels();

        // TODO: maybe notify the plugins that the editor has changed
    });

    watch(() => materialStore.currentMaterial, async () => {
        const material = toRaw(materialStore.currentMaterial) as Material | undefined;
        if (!material) return;

        const toLoadPlugins = (material.plugins
            .filter((p) => !pluginManager.isActive(p.plugin))
            .map((p) => plugins.value.find((plugin) => plugin.id === p.plugin))
            .filter((p) => p !== undefined) as Plugin[])
            .filter((p) => p.releases.length <= 0)
            .map((p) => p.id);

        if(toLoadPlugins.length > 0) {
            await loadMultiple(toLoadPlugins);
        }

        for (const plugin of material.plugins) {
            if(pluginManager.isActive(plugin.plugin)) continue;

            const pluginObject = plugins.value.find((p) => p.id === plugin.plugin);

            if (!pluginObject) {
                console.error("Plugin not found", plugin.plugin);
                continue;
            }

            const release = pluginObject.releases.find((r) => r.version === plugin.release);

            if (!release) {
                console.error("Release not found", plugin.release);
                continue;
            }

            const pluginContext = new PluginContext(pluginObject, release, editorStore.getEditor()!);

            await pluginManager.loadPlugin(pluginContext);
        }

        await getPanels();
    });

    const addPluginToMaterial = async (plugin: Plugin) => {
        const material = toRaw(materialStore.currentMaterial) as Material | undefined;
        if (!material) return;

        // Does it already have the plugin?
        if (material.plugins.find((p) => p.plugin === plugin.id)) {
            return false;
        }

        if(plugin.releases.length === 0) {
            // note(Matej): This will happened when the plugin is loaded just in "overview" mode
            // We need to load the plugin in full of releases

            const foundPlugin = await loadOne(plugin.id);

            if(!foundPlugin) {
                console.error("Failed to load plugin");
                return false;
            }

            plugin = foundPlugin;
        }

        const lastRelease = plugin.releases.sort((a, b) => a.date.diff(b.date))[0].version;

        material.plugins.push(new MaterialPlugin(plugin.id, lastRelease));

        await materialStore.save();

        await pluginManager.loadPlugin(new PluginContext(plugin, plugin.releases.find((r) => r.version === lastRelease)!, editorStore.getEditor()!));

        await getPanels();

        return true;
    }

    const removePluginFromMaterial = async (plugin: PluginContext) => {
        const material = toRaw(materialStore.currentMaterial) as Material | undefined;
        if (!material) return;

        const index = material.plugins.findIndex((p) => p.plugin === plugin.getId());

        if (index === -1) {
            return false;
        }

        material.plugins.splice(index, 1);

        await materialStore.save();

        pluginManager.removePlugin(plugin.getId());

        pluginPanels.value = await pluginManager.getEditorPanels();

        return true;
    }

    return {
        plugins,
        load,
        tags,
        panels: pluginPanels,
        manager: pluginManager,
        addPluginToMaterial,
        removePluginFromMaterial,
    }
});
