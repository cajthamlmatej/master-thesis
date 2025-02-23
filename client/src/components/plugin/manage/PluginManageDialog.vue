<template>
    <Dialog>
        <template #activator="{toggle}">
            <NavigationButton
                :label="$t('editor.ui.plugin.manage')"
                :tooltip-text="$t('editor.ui.plugin.manage')"
                @click="toggle"
                icon="package-variant"></NavigationButton>
        </template>
        <template #default>
            <Card dialog>
                <Tabs v-model:selected="selected" fluid :items="[
                    {value: 'active', text:$t('editor.plugin.manage.active')},
                    {value: 'browse', text:$t('editor.plugin.manage.browse.title')}
                ]"></Tabs>

                <div v-if="selected == 'active'">
                    <List>
                        <ListItem class="plugin flex-align-center" v-for="plugin in plugins" :key="plugin.plugin.getName()">
                            <div class="meta">
                                <span><span :class="`mdi mdi-` + plugin.plugin.getIcon()"></span> {{
                                        plugin.plugin.getName()
                                    }} (v{{ plugin.plugin.getVersion() }})</span>
                                <span class="author">{{
                                        $t('editor.plugin.manage.by', {name: plugin.plugin.getAuthor()})
                                    }}</span>
                            </div>
                            <div class="warning-container" v-if="plugin.newVersion">
                                <div class="warning" v-tooltip="$t('editor.plugin.manage.new-version')">
                                    <span class="mdi mdi-shield-alert-outline"></span>
                                </div>
                            </div>

                            <div class="actions">
                                <Button
                                    icon="package-variant-closed-minus"
                                    v-tooltip="$t('editor.plugin.manage.deactivate')"
                                    @click="removePlugin(plugin.plugin as PluginContext)"
                                    :loading="loading"
                                ></Button>
                            </div>
                        </ListItem>
                        <ListItem v-if="plugins.length == 0">
                            {{ $t('editor.plugin.manage.no-plugins') }}
                        </ListItem>
                    </List>
                </div>
                <div v-else-if="selected == 'browse'">
                    <PluginBrowse/>
                </div>
            </Card>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import {$t} from "@/translation/Translation";
import {onMounted, ref, watch} from "vue";
import ListItem from "@/components/design/list/ListItem.vue";
import {PluginContext} from "@/editor/plugin/PluginContext";
import PluginBrowse from "@/components/plugin/manage/PluginBrowse.vue";
import {usePluginStore} from "@/stores/plugin";

const selected = ref('active');

const pluginStore = usePluginStore();
const plugins = ref<{
    plugin: PluginContext,
    newVersion: boolean
}[]>([]);

onMounted(() => {
    recalculate();
    pluginStore.manager.PLUGIN_LOADED.on(() => recalculate());
});

watch(() => pluginStore.manager, () => {
    recalculate();
    pluginStore.manager.PLUGIN_LOADED.on(() => recalculate());
});

const recalculate = () => {
    plugins.value = pluginStore.manager.getPlugins().map(p => {
        const plugin = pluginStore.plugins.find(pl => pl.id == p.getId())!;

        const latestVersion = [...plugin.releases].sort((a, b) => a.date.diff(b.date)).pop()!;
        const newVersion = latestVersion.version != p.getVersion();

        return {
            plugin: p,
            newVersion: newVersion
        }
    })
};

const loading = ref(false);

const removePlugin = async (plugin: PluginContext) => {
    loading.value = true;
    await pluginStore.removePluginFromMaterial(plugin);
    loading.value = false;
};
</script>

<style scoped lang="scss">
.plugin {
    .meta {
        display: flex;
        flex-direction: column;

        .author {
            font-size: 0.8rem;
            color: var(--color-text-subtle);
        }
    }

    .warning-container {
        display: flex;
        justify-content: start;
        align-items: center;

        flex-grow: 1;

        .warning {
            background-color: var(--color-primary);
            border-radius: 50%;
            width: 2em;
            height: 2em;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.5rem;
        }
    }
}
</style>
