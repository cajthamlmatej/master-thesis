<template>
    <Tabs
        v-model:selected="releaseInfo"
        :items="[
            {
                value: 'BASE',
                text: $t('page.plugins.release.info.base'),
            },
            {
                value: 'CHANGELOG',
                text: $t('page.plugins.release.info.changelog'),
            },
            {
                value: 'EDITOR',
                text: $t('page.plugins.release.info.editor'),
            },
            {
                value: 'PLAYER',
                text: $t('page.plugins.release.info.player'),
            },
            {
                value: 'SUMMARY',
                text: $t('page.plugins.release.info.summary'),
            }
        ]"
    ></Tabs>

    <div v-if="releaseInfo == 'BASE'">
        <p v-t class="mb-1">page.plugins.new-release.help</p>

        <Input v-model:value="data.version"
           :label="$t('page.plugins.new-release.info.version.label')"
               :validators="[
                    (value: string) => value.length > 0 || $t('page.plugins.release.new-release.version.error'),
               ]"
        />
        <Input type="textarea" v-model:value="data.manifest"
           :label="$t('page.plugins.new-release.info.manifest.label')"
               :validators="[
                    (value: string) => isValidJSON(value) || $t('page.plugins.new-release.info.manifest.error'),
                    (value: string) => !!JSON.parse(value).manifest || $t('page.plugins.new-release.info.manifest.error.manifest.required'),
                    (value: string) => (typeof JSON.parse(value).manifest == 'number' && Math.round(Number(JSON.parse(value).manifest)) === JSON.parse(value).manifest && !isNaN(Number(JSON.parse(value).manifest))) || $t('page.plugins.release.info.manifest.error.manifest.number'),
                    (value: string) => !JSON.parse(value).allowedOrigins ? true : ((Array.isArray(JSON.parse(value).allowedOrigins) && JSON.parse(value).allowedOrigins.every((a: any) => typeof a === 'string' && !!a.match(/^https?:\/\/[a-z]+.[a-z]+$/))) || $t('page.plugins.release.info.manifest.error.allowedOrigins.string')),
               ]"
        />
    </div>
    <div v-else-if="releaseInfo == 'CHANGELOG'">
        <Input type="textarea" v-model:value="data.changelog"
               :label="$t('page.plugins.new-release.info.changelog.label')"
               :validators="[
                    (value: string) => value.length > 0 || $t('page.plugins.release.new-release.changelog.error'),
               ]"
        />
    </div>
    <div v-else-if="releaseInfo == 'EDITOR'">
        <Input type="textarea" v-model:value="data.editor"
               :label="$t('page.plugins.release.new-release.editor.label')"
        />
    </div>
    <div v-else-if="releaseInfo == 'PLAYER'">
        <Input type="textarea" v-model:value="data.player"
               :label="$t('page.plugins.release.new-release.player.label')"
        />
    </div>
    <div v-else-if="releaseInfo == 'SUMMARY'">
        <p v-t class="mb-1">page.plugins.new-release.summary.help</p>

        <div class="flex flex-justify-end">
            <Button
                :disabled="!canContinue()"
                :loading="creating"
                @click="send"
            >
                <span v-t>page.plugins.release.info.summary.button</span>
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">

import {$t} from "@/translation/Translation";
import Tabs from "@/components/design/tabs/Tabs.vue";
import {PropType, reactive, ref} from "vue";
import {usePluginStore} from "@/stores/plugin";
import Plugin from "@/models/Plugin";

const props = defineProps({
    plugin: {
        type: Object as PropType<Plugin>,
        required: true,
    },
});

const releaseInfo = ref('BASE');

const data = reactive({
    version: '',
    manifest: '',
    changelog: '',
    editor: '',
    player: '',
});

const isValidJSON = (value: string) => {
    try {
        JSON.parse(value);
        return true;
    } catch (e) {
        return false;
    }
};

const canContinue = () => {
    if(data.version.length === 0) {
        return false;
    }

    if(data.manifest.length === 0) {
        return false;
    }

    if(!isValidJSON(data.manifest)) {
        return false;
    }

    if(!JSON.parse(data.manifest).manifest) {
        return false;
    }

    if(!((typeof JSON.parse(data.manifest).manifest == 'number' && Math.round(Number(JSON.parse(data.manifest).manifest)) === JSON.parse(data.manifest).manifest && !isNaN(Number(JSON.parse(data.manifest).manifest))))) {
        return false;
    }

    if(!(!JSON.parse(data.manifest).allowedOrigins ? true : ((Array.isArray(JSON.parse(data.manifest).allowedOrigins) && JSON.parse(data.manifest).allowedOrigins.every((a: any) => typeof a === 'string' && !!a.match(/^https?:\/\/[a-z]+.[a-z]+$/)))))) {
        return false;
    }

    if(data.changelog.length === 0) {
        return false;
    }

    if(data.editor.length === 0 && data.player.length === 0) {
        return false;
    }

    return true;
}

const emits = defineEmits(['close'])

const creating = ref(false);
const pluginStore = usePluginStore();
const send = async() => {
    if(creating.value || !canContinue()) {
        return;
    }

    creating.value = true;
    await pluginStore.createPluginRelease(props.plugin, {
        version: data.version,
        manifest: data.manifest,
        changelog: data.changelog,
        editorCode: data.editor,
        playerCode: data.player,
    });
    creating.value = false;

    emits('close');
}
</script>
