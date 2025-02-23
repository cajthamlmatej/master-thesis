<template>
    <Navigation v-model:menu="menu" full-control shift>
        <template #primary>
            <div v-show="menu" class="menu">
                <iframe
                    ref="iframe"
                    sandbox="allow-scripts"
                    :srcdoc="panel.content"
                >
                </iframe>
            </div>
        </template>
    </Navigation>
</template>

<script lang="ts" setup>

import {computed, nextTick, onMounted, PropType, ref, toRaw, watch} from "vue";

import {PluginEditorPanel} from "@/editor/plugin/PluginEditorPanel";

const props = defineProps<{
    value: boolean;
    panel: PluginEditorPanel;
}>();

const panel = computed(() => props.panel as PluginEditorPanel);

const menu = ref<boolean>(false);

watch(() => props.value, (value) => {

    menu.value = value;
});

const iframe = ref<HTMLIFrameElement | null>(null);
watch(() => iframe.value, (value) => {
    if(!value) return;

    const plugin = toRaw(panel.value.plugin);
    window.addEventListener("message", (event) => {
        const data = event.data;

        if(typeof data !== "object" || !('target' in data) || !('message' in data)) {
            plugin.log("Invalid message received from parent", data);
            return;
        }

        if(event.source !== iframe.value!.contentWindow) {
            plugin.log("Invalid source received from parent", data);
            return;
        }

        if(data.target === "script") {
            plugin.getEditorPlugin()!.processMessageFromParent(data.message);
        } else if(data.target === "editor") {
            if(data.message === 'close') {
                menu.value = false;
            } else {
                plugin.log("Invalid message received from parent, editor can't process", data.message);
            }
        } else {
            plugin.log("Invalid target received from parent", data);
        }
    });
});
</script>

<style lang="scss" scoped>
:deep(.menu) {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;

    iframe {
        width: 100%;
        height: 100%;
        border: none;
    }
}
</style>
