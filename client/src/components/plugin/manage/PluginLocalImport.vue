<template>
    <FileInput v-model:value="files"
               :validators="[
                   (file: File[]) => file && file.length > 0 && file[0].name?.endsWith('.zip') || ''
               ]"/>

    <Alert v-if="error" class="mt-2" type="error">
        {{ error }}
    </Alert>

    <div class="flex flex-justify-end">
        <Button
            v-tooltip="hasLocalPlugin ? $t('player.debug.plugin.error.localPluginAlreadyExists') : (files.length == 0 ? $t('player.debug.plugin.error.missingFile') : '')"
            :disabled="hasLocalPlugin || files.length == 0"
            :label="hasLocalPlugin ? $t('player.debug.plugin.error.localPluginAlreadyExists') : (files.length == 0 ? $t('player.debug.plugin.error.missingFile') : '')"
            class="mt-1"
            icon="check"
            @click="process"
        >
            <span v-t>player.debug.plugin.import</span>
        </Button>
    </div>
</template>

<script lang="ts" setup>
import FileInput from "@/components/design/input/FileInput.vue";
import {onMounted, ref} from "vue";
import {$t} from "@/translation/Translation";
import JSZip from "jszip";
import {usePluginStore} from "@/stores/plugin";
import Plugin from "@/models/Plugin";
import {useUserStore} from "@/stores/user";
import moment from "moment";
import {useEditorStore} from "@/stores/editor";
import {usePlayerStore} from "@/stores/player";

const files = ref<File[]>([]);
const error = ref<string | null>(null);

const hasLocalPlugin = ref(false);

onMounted(() => {
    hasLocalPlugin.value = !!pluginStore.manager.getPlugin('LOCAL');

    if (hasLocalPlugin.value) {
        error.value = $t('player.debug.plugin.error.localPluginAlreadyExists');
    }
})

const pluginStore = usePluginStore();
const userStore = useUserStore();
const editorStore = useEditorStore();
const playerStore = usePlayerStore();

const emits = defineEmits(['done']);

const process = () => {
    const file = files.value[0];

    if (!file) return;

    error.value = null;

    if (!file.name.endsWith('.zip')) {
        error.value = $t('player.debug.plugin.error.zipError');
        return;
    }

    // Parse ZIP

    const reader = new FileReader();

    let plugin = {
        manifest: undefined as string | undefined,
        editor: undefined as string | undefined,
        player: undefined as string | undefined,
    }

    reader.onload = (event) => {
        const zip = new JSZip();
        if (!event.target?.result) {
            error.value = $t('player.debug.plugin.error.readingFile');
            return;
        }

        zip.loadAsync(event.target?.result as ArrayBuffer).then(async (zip) => {
            const manifestFile = zip.file('manifest.json');

            if (!manifestFile) {
                error.value = $t('player.debug.plugin.error.noManifest');
                return;
            }

            plugin.manifest = await manifestFile.async('string');

            const editorFile = zip.file('editor.js');

            if (editorFile) {
                plugin.editor = await editorFile.async('string');
            }

            const playerFile = zip.file('player.js');

            if (playerFile) {
                plugin.player = await playerFile.async('string');
            }

            if (!plugin.editor && !plugin.player) {
                error.value = $t('player.debug.plugin.error.noCode');
                return;
            }

            const pluginObj = new Plugin(userStore.user?.name ?? "Local",
                "LOCAL",
                "LOCAL PLUGIN",
                "shield-bug-outline",
                "Local plugin uploaded by current user.",
                [],
                [
                    {
                        date: moment(),
                        manifest: plugin.manifest!,
                        editorCode: plugin.editor,
                        playerCode: plugin.player,
                        version: "0",
                        changelog: ""
                    }
                ]);

            pluginStore.manager.setDebugPlugin(pluginObj);

            emits('done');
        }).catch((error) => {
            console.error(error);
            error.value = $t('player.debug.plugin.error.zipError');
        });
    };

    reader.onerror = (event) => {
        error.value = $t('player.debug.plugin.error.readingFile');
    };

    reader.readAsArrayBuffer(file);
}
</script>
