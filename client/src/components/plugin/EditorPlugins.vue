<template>
    <div class="editor-navigation-plugins">
        <PluginManageDialog/>
        <Divider v-if="pluginPanels.length >= 1"/>
        <NavigationButton
            v-for="panel in pluginPanels"
            :active="panel.name === value"
            :icon="panel.icon"
            :label="$t('editor.ui.plugin.plugin', {name: panel.name})"
            :tooltip-text="$t('editor.ui.plugin.plugin', {name: panel.name})"
            @click="emits('update:value', panel.name === value ? null : panel.name)"></NavigationButton>

    </div>

    <teleport to="body">
        <PluginPanel
            v-for="panel in pluginPanels"
            :panel="panel as PluginEditorPanel"
            :value="props.value === panel.name"
        />
    </teleport>
</template>

<script lang="ts" setup>
import {computed, PropType} from "vue";
import {usePluginStore} from "@/stores/plugin";
import {PluginEditorPanel} from "@/editor/plugin/PluginEditorPanel";
import PluginManageDialog from "@/components/plugin/manage/PluginManageDialog.vue";
import PluginPanel from "@/components/plugin/panel/PluginPanel.vue";
import {$t} from "@/translation/Translation";

const props = defineProps({
    value: String as PropType<string | null>
});

const emits = defineEmits(["update:value"]);

const pluginStore = usePluginStore();
const pluginPanels = computed(() => pluginStore.panels);
</script>

<style lang="scss" scoped>
</style>
