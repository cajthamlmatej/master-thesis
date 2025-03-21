import {defineStore} from "pinia";
import {ref, toRaw, watch} from "vue";
import {api} from "@/api/api";
import Plugin from "@/models/Plugin";
import {PluginManager} from "@/editor/plugin/PluginManager";
import PluginMapper from "@/models/mappers/PluginMapper";
import {PluginEditorPanel} from "@/editor/plugin/PluginEditorPanel";
import {useEditorStore} from "@/stores/editor";
import {useMaterialStore} from "@/stores/material";
import Material, {MaterialPlugin} from "@/models/Material";
import {PluginContext} from "@/editor/plugin/PluginContext";
import {usePlayerStore} from "@/stores/player";
import {useRouter} from "vue-router";
import {communicator} from "@/api/websockets";

export const usePluginStore = defineStore("plugin", () => {
    const plugins = ref([] as Plugin[]);
    let loadedResolve = (val?: any) => {
    };
    let loaded = new Promise((r) => loadedResolve = r);

    let pluginManager = new PluginManager();
    const pluginPanels = ref<PluginEditorPanel[]>([]);

    const editorStore = useEditorStore();
    const playerStore = usePlayerStore();
    const materialStore = useMaterialStore();

    const tags = [
        "WIDGETS",
        "CONTENT",
        "EDITOR",
        "PLAYER",
        "GAMIFICATION",
    ]

    const router = useRouter();
    watch(() => router.currentRoute.value, async () => {
        pluginManager = new PluginManager();
    });

    const load = async () => {
        const response = await api.plugin.all();

        if (response === undefined) {
            return;
        }

        plugins.value = response.plugins.map((p) => PluginMapper.fromPluginDTO(p));
    };
    const loadOne = async (id: string) => {
        (await loadMultiple([id]));
        return plugins.value.find((p) => p.id === id);
    }
    const loadMultiple = async (ids: string[]) => {
        const response = await api.plugin.specific(ids);

        if (response === undefined) {
            return;
        }

        plugins.value = plugins.value.map((p) => {
            const plugin = response.plugins.find((plugin) => plugin.id === p.id);
            if (!plugin) {
                console.error("Plugin is loaded but currently not in the list", p.id);
                return p;
            }

            return PluginMapper.fromPluginDTO(plugin);
        });

        for (const plugin of response.plugins) {
            const foundPlugin = plugins.value.find((p) => p.id === plugin.id);

            if (!foundPlugin) {
                plugins.value.push(PluginMapper.fromPluginDTO(plugin));
            }
        }
    }

    const getPanels = async () => {
        pluginPanels.value = await pluginManager.getEditorPanels();
    }

    watch(() => editorStore.getEditor(), async () => {
        const editor = editorStore.getEditor();
        if (!editor) return;

        await pluginManager.changeEditor(editor);

        await getPanels();

        // TODO: maybe notify the plugins that the editor has changed
    });
    watch(() => playerStore.getPlayer(), async () => {
        const player = playerStore.getPlayer();
        if (!player) return;

        await pluginManager.changePlayer(player);
    });

    watch(() => materialStore.currentMaterial, async () => {
        // loaded = new Promise((r) => loadedResolve = r);
        const material = toRaw(materialStore.currentMaterial) as Material | undefined;
        if (!material) return;

        const toLoadPlugins = (material.plugins
            .filter((p) => !pluginManager.isActive(p.plugin))
            .map((p) => plugins.value.find((plugin) => plugin.id === p.plugin))
            .filter((p) => p !== undefined) as Plugin[])
            .filter((p) => p.releases.length <= 0)
            .map((p) => p.id);

        if (toLoadPlugins.length > 0) {
            await loadMultiple(toLoadPlugins);
        }

        for (const plugin of material.plugins) {
            if (pluginManager.isActive(plugin.plugin)) continue;

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

            const pluginContext = new PluginContext(pluginObject, release, editorStore.getEditor()!, playerStore.getPlayer()!);

            await pluginManager.loadPlugin(pluginContext);
        }
        loadedResolve();

        await getPanels();
    });

    const addPluginToMaterial = async (plugin: Plugin) => {
        const material = toRaw(materialStore.currentMaterial) as Material | undefined;
        if (!material) return;

        // Does it already have the plugin?
        if (material.plugins.find((p) => p.plugin === plugin.id)) {
            return false;
        }

        if (plugin.releases.length === 0) {
            // note(Matej): This will happened when the plugin is loaded just in "overview" mode
            //     We need to load the plugin in full of releases

            const foundPlugin = await loadOne(plugin.id);

            console.log("Plugin", foundPlugin);

            if (!foundPlugin) {
                console.error("Failed to load plugin");
                return false;
            }

            plugin = foundPlugin;
        }

        const lastRelease = [...plugin.releases].sort((a, b) => a.date.diff(b.date))[0].version;

        material.plugins.push(new MaterialPlugin(plugin.id, lastRelease));

        await materialStore.save();

        await pluginManager.loadPlugin(
            new PluginContext(plugin,
                plugin.releases.find((r) => r.version === lastRelease)!,
                editorStore.getEditor()!, playerStore.getPlayer()!));

        await getPanels();

        materialStore.synchronize();
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
        loaded,
        load,
        loadOne,
        tags,
        panels: pluginPanels,
        manager: pluginManager,
        addPluginToMaterial,
        removePluginFromMaterial,
    }
});
