<template>
    <Navigation v-model:menu="menu" full-control shift>
        <template #primary>
            <div v-show="menu" class="menu">
                <iframe
                    ref="iframe"
                    :srcdoc="panel.content"
                    sandbox="allow-scripts"
                >
                </iframe>
            </div>
        </template>
    </Navigation>
</template>

<script lang="ts" setup>

import {computed, ref, toRaw, watch} from "vue";

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
    if (!value) return;

    const plugin = toRaw(panel.value.plugin);

    plugin.getEditorPlugin()!.setPanelMessageCallback((message) => {
        try {
            const iframeContentWindow = toRaw(iframe.value)!.contentWindow!;

            iframeContentWindow.postMessage({
                target: "panel",
                message: message
            }, "*");
        } catch (e) {
            plugin.log("Error sending message to panel: " + e);
        }
    });

    window.addEventListener("message", (event) => {
        const data = event.data;

        if (typeof data !== "object" || !('target' in data) || !('message' in data)) {
            plugin.log("Invalid message received from parent: " + data);
            return;
        }

        if (event.source !== iframe.value?.contentWindow) {
            return;
        }

        if (data.target === "script") {
            plugin.getEditorPlugin()!.processMessageFromPanel(data.message);
        } else if (data.target === "editor") {
            if (data.message === 'close') {
                menu.value = false;
            } else {
                plugin.log("Invalid message received from parent, editor can't process: " + data.message);
            }
        } else {
            plugin.log("Invalid target received from parent: " + data);
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
        min-height: calc(100vh - 5em);
    }
}
</style>
