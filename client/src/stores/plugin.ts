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
import {useUserStore} from "@/stores/user";
import Editor from "@/editor/Editor";
import Player from "@/editor/player/Player";

export const usePluginStore = defineStore("plugin", () => {
    const plugins = ref([] as Plugin[]);
    let loadedResolve = (val?: any) => {
    };
    let loaded = new Promise((r) => loadedResolve = r);

    let pluginManager = ref<PluginManager>(new PluginManager());
    const pluginPanels = ref<PluginEditorPanel[]>([]);

    const editorStore = useEditorStore();
    const playerStore = usePlayerStore();
    const materialStore = useMaterialStore();
    const userStore = useUserStore();

    const tags = [
        "WIDGETS",
        "CONTENT",
        "EDITOR",
        "PLAYER",
        "GAMIFICATION",
    ]

    const router = useRouter();
    watch(() => router.currentRoute.value, async () => {
        pluginManager.value = new PluginManager();
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
                //console.error("Plugin is loaded but currently not in the list", p.id);
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
    const loadForUser = async () => {
        await userStore.userLoaded;
        const user = userStore.user?.id;

        if (!user) {
            return;
        }

        const response = await api.plugin.forUser(user);

        if (response === undefined) {
            return;
        }

        plugins.value = [];

        for (const plugin of response.plugins) {
            plugins.value.push(PluginMapper.fromPluginDTO(plugin));
        }
    }

    const getPanels = async () => {
        pluginPanels.value = await pluginManager.value.getEditorPanels();
    }

    const loadPlugins = async (editor?: Editor, player?: Player) => {
        loaded = new Promise((r) => loadedResolve = r);

        pluginManager.value.clear();

        const material = toRaw(materialStore.currentMaterial) as Material | undefined;
        if (!material) return;

        const toLoadPlugins = (material.plugins
            // .filter((p) => !pluginManager.isActive(p.plugin))
            .map((p) => plugins.value.find((plugin) => plugin.id === p.plugin))
            .filter((p) => p !== undefined) as Plugin[])
            .filter((p) => p.releases.length <= 0)
            .map((p) => p.id);

        if (toLoadPlugins.length > 0) {
            await loadMultiple(toLoadPlugins);
        }

        for (const plugin of material.plugins) {
            // if (pluginManager.isActive(plugin.plugin)) continue;

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

            const pluginContext = new PluginContext(pluginObject, release, editor, player);

            await pluginManager.value.loadPlugin(pluginContext);
            await pluginContext.loaded;
        }

        if (pluginManager.value.debugPlugin) {
            const debugPlugin = pluginManager.value.debugPlugin;
            const pluginContext = new PluginContext(debugPlugin, debugPlugin.releases[0]!, editor, player);

            await pluginManager.value.loadPlugin(pluginContext);
            await pluginContext.loaded;
        }

        loadedResolve();


        await getPanels();
    }

    // watch(() => materialStore.currentMaterial, async () => {
    //     loadPlugins();
    // });

    const addPluginToMaterial = async (plugin: Plugin) => {
        const material = toRaw(materialStore.currentMaterial) as Material | undefined;
        if (!material) return false;

        // Does it already have the plugin?
        if (material.plugins.find((p) => p.plugin === plugin.id)) {
            return false;
        }

        if (plugin.releases.length === 0) {
            // note(Matej): This will happened when the plugin is loaded just in "overview" mode
            //     We need to load the plugin in full of releases

            const foundPlugin = await loadOne(plugin.id);

            if (!foundPlugin) {
                console.error("Failed to load plugin");
                return false;
            }

            plugin = foundPlugin;
        }

        const lastRelease = [...plugin.releases].sort((a, b) => b.date.diff(a.date))[0].version;

        material.plugins.push(new MaterialPlugin(plugin.id, lastRelease));

        await materialStore.save();

        await pluginManager.value.loadPlugin(
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

        pluginManager.value.removePlugin(plugin.getId());

        pluginPanels.value = await pluginManager.value.getEditorPanels();
        materialStore.synchronize();

        return true;
    }

    const createPluginRelease = async (plugin: Plugin, release: {
        version: string,
        changelog: string,
        manifest: string,
        editorCode: string,
        playerCode: string
    }) => {
        const response = await api.plugin.createRelease(plugin.id, release);

        if (response === undefined) {
            return;
        }

        await loadForUser();
    }

    const createPlugin = async (data: {
        name: string;
        icon: string;
        description: string;
        tags: string[];
    }) => {
        const response = await api.plugin.create(data);

        if (response === undefined) {
            return;
        }

        await loadForUser();
    }

    const updatePlugin = async (plugin: Plugin, data: {
        name?: string;
        icon?: string;
        description?: string;
        tags?: string[];
    }) => {
        const response = await api.plugin.update(plugin.id, data);

        if (response === undefined) {
            return;
        }

        await loadForUser();
    }

    return {
        plugins,
        loaded,
        load,
        loadPlugins,
        loadOne,
        tags,
        panels: pluginPanels,
        manager: pluginManager,
        addPluginToMaterial,
        removePluginFromMaterial,
        loadForUser,
        createPluginRelease,
        createPlugin,
        updatePlugin,
        getPanels
    }
});
