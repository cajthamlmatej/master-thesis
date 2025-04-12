<template>
    <Dialog stretch>
        <template #activator="{toggle}">
            <NavigationButton
                :label="$t('editor.ui.plugin.manage')"
                :tooltip-text="$t('editor.ui.plugin.manage')"
                icon="package-variant"
                @click="toggle"></NavigationButton>
        </template>
        <template #default>
            <Card dialog class="editor-plugin-manage-dialog">
                <div class="tabs">
                    <Tabs v-model:selected="selected" :items="[
                        {value: 'active', text:$t('editor.plugin.manage.active')},
                        {value: 'browse', text:$t('editor.plugin.manage.browse.title')}
                    ]" fluid></Tabs>
                </div>

                <div v-if="selected == 'active'">
                    <List>
                        <ListItem v-for="plugin in plugins" :key="plugin.plugin.getName()"
                                  class="plugin flex-align-center">
                            <div class="meta">
                                <span><span :class="`mdi mdi-` + plugin.plugin.getIcon()"></span> {{
                                        plugin.plugin.getName()
                                    }} (v{{ plugin.plugin.getVersion() }})</span>
                                <span class="author">{{
                                        $t('editor.plugin.manage.by', {
                                            name: plugin.plugin.getAuthor(),
                                            version: plugin.plugin.getManifestVersion().toString()
                                        })
                                    }}</span>
                            </div>
                            <div v-if="plugin.newVersion" class="warning-container">
                                <div v-tooltip="$t('editor.plugin.manage.new-version')" class="warning">
                                    <span class="mdi mdi-shield-alert-outline"></span>
                                </div>
                            </div>

                            <div class="actions">
                                <Button
                                    v-tooltip="$t('editor.plugin.manage.deactivate')"
                                    :loading="loading"
                                    icon="package-variant-closed-minus"
                                    @click="removePlugin(plugin.plugin as PluginContext)"
                                ></Button>
                            </div>
                        </ListItem>
                        <ListItem v-if="plugins.length == 0">
                            {{ $t('editor.plugin.manage.no-plugins') }}
                        </ListItem>
                    </List>

                    <p
                        v-if="disabled.length > 0"
                        class="disabled-title"
                    >{{ $t('editor.plugin.manage.disabled.title') }}</p>

                    <p
                        v-if="disabled.length > 0" class="disabled-description">{{
                            $t('editor.plugin.manage.disabled.description')
                        }}</p>

                    <List v-if="disabled.length > 0">
                        <ListItem v-for="plugin in disabled" :key="plugin.getName()"
                                  class="plugin disabled flex-align-center">
                            <div class="meta">
                                <span><span :class="`mdi mdi-` + plugin.getIcon()"></span> {{
                                        plugin.getName()
                                    }} (v{{ plugin.getVersion() }})</span>
                                <span class="author">{{
                                        $t('editor.plugin.manage.by', {
                                            name: plugin.getAuthor(),
                                            version: plugin.getManifestVersion().toString()
                                        })
                                    }}</span>
                            </div>

                            <div class="actions">
                                <Button
                                    v-tooltip="$t('editor.plugin.manage.deactivate')"
                                    :loading="loading"
                                    icon="package-variant-closed-minus"
                                    @click="removePlugin(plugin as PluginContext)"
                                ></Button>
                            </div>
                        </ListItem>
                    </List>

                    <Dialog>
                        <template #activator="{toggle}">
                            <Button
                                @click="toggle"
                                icon="package-variant-plus"
                                class="mt-1"
                            >
                                <span v-t>player.debug.plugin.addLocal</span>
                            </Button>
                        </template>
                        <template #default="{toggle}">
                            <Card dialog>
                                <PluginLocalImport @done="toggle" />
                            </Card>
                        </template>
                    </Dialog>
                </div>
                <div v-else-if="selected == 'browse'">
                    <PluginBrowse/>
                </div>

                <p class="version">{{ $t('editor.plugin.manage.manifest', {version: manifestVersion.toString()}) }}</p>
            </Card>
        </template>
    </Dialog>
</template>

<script lang="ts" setup>
import {$t} from "@/translation/Translation";
import {onMounted, ref, watch} from "vue";
import ListItem from "@/components/design/list/ListItem.vue";
import {PluginContext} from "@/editor/plugin/PluginContext";
import PluginBrowse from "@/components/plugin/manage/PluginBrowse.vue";
import {usePluginStore} from "@/stores/plugin";
import {PluginManager} from "@/editor/plugin/PluginManager";
import Card from "@/components/design/card/Card.vue";
import FileInput from "@/components/design/input/FileInput.vue";
import PluginLocalImport from "@/components/plugin/manage/PluginLocalImport.vue";

const selected = ref('active');

const pluginStore = usePluginStore();
const plugins = ref<{
    plugin: PluginContext,
    newVersion: boolean
}[]>([]);
const disabled = ref<PluginContext[]>([]);

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
        const plugin = pluginStore.plugins.find(pl => pl.id == p.getId());

        if(!plugin) {
            return {
                plugin: p,
                newVersion: false
            }
        }

        const latestVersion = [...plugin.releases].sort((a, b) => a.date.diff(b.date)).pop();
        if (!latestVersion) {
            return {
                plugin: p,
                newVersion: false
            }
        }

        const newVersion = latestVersion.version != p.getVersion();

        return {
            plugin: p,
            newVersion: newVersion
        }
    });

    disabled.value = pluginStore.manager.getDisabledPlugins();

};

const loading = ref(false);

const removePlugin = async (plugin: PluginContext) => {
    loading.value = true;
    await pluginStore.removePluginFromMaterial(plugin);
    loading.value = false;
    recalculate();
};

const manifestVersion = PluginManager.CURRENT_MANIFEST_VERSION;
</script>
