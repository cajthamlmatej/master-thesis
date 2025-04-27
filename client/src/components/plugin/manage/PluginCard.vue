<template>
    <div :class="{
        'plugin--active': props.active,
    }" class="plugin">
        <div class="icons">
            <span :class="`mdi mdi-` + plugin.icon"></span>
        </div>

        <div class="meta">
            <p>{{ plugin.name }}</p>
            <p class="author">{{ plugin.author }}</p>
        </div>

        <div class="description">
            <p>{{ plugin.description }}</p>
        </div>

        <div class="lastVersion">
            <p>
                {{
                    $t("editor.plugin.manage.browse.last-version", {date: plugin.lastReleaseDate.format("DD. MM. YYYY")})
                }}</p>
        </div>

        <div v-if="includeActions" class="actions">
            <Dialog>
                <template #activator="{toggle}">
                    <Button
                        v-tooltip="plugin.lastManifest.manifest != PluginManager.CURRENT_MANIFEST_VERSION.toString() ? $t('editor.plugin.manage.old-version') : $t('editor.plugin.manage.activate.title')"
                        :label="plugin.lastManifest.manifest != PluginManager.CURRENT_MANIFEST_VERSION.toString() ? $t('editor.plugin.manage.old-version') : $t('editor.plugin.manage.activate.title')"
                        :disabled="plugin.lastManifest.manifest != PluginManager.CURRENT_MANIFEST_VERSION.toString()"
                        :loading="loading"
                        icon="package-variant-closed-plus"
                        @click="() => plugin.requiresUserAttention() ? toggle() : activate()"
                    ></Button>
                </template>

                <template #default="{toggle}">
                    <Card dialog>
                        <p class="title" v-t>editor.plugin.manage.attention.title</p>

                        <p v-t>editor.plugin.manage.attention.description</p>

                        <p v-t v-if="plugin.lastManifest.allowedOrigins.length > 0" class="mt-1">editor.plugin.manage.attention.allowed-origins</p>
                        <List v-if="plugin.lastManifest.allowedOrigins.length > 0">
                            <ListItem v-for="origin in plugin.lastManifest.allowedOrigins" :key="origin">
                                <span>{{ origin }}</span>
                            </ListItem>
                        </List>

                        <div class="flex flex-justify-end gap-1 flex-wrap mt-1">
                            <Button
                                @click="toggle"
                            >
                                <span v-t>editor.plugin.manage.attention.cancel</span>
                            </Button>
                            <Button
                                @click="() => {activate(); toggle()}"
                            >
                                <span v-t>editor.plugin.manage.attention.confirm</span>
                            </Button>
                        </div>
                    </Card>
                </template>
            </Dialog>
        </div>

        <transition name="fade">
            <Alert
                v-if="error"
                fluidy
                type="error"
            >
                {{ error }}
            </Alert>
        </transition>
    </div>
</template>

<script lang="ts" setup>

import {computed, PropType, ref} from "vue";
import {$t} from "@/translation/Translation";
import Plugin from "@/models/Plugin";
import {usePluginStore} from "@/stores/plugin";
import {PluginManager} from "@/editor/plugin/PluginManager";
import ListItem from "@/components/design/list/ListItem.vue";
import {useEditorStore} from "@/stores/editor";

const props = defineProps({
    plugin: {
        type: Object as PropType<Plugin>,
        required: true,
    },
    active: {
        type: Boolean,
        default: false,
    },
    includeActions: {
        type: Boolean,
        default: false,
    }
});

const plugin = computed(() => props.plugin!);

const pluginStore = usePluginStore();

const emits = defineEmits(['activate']);

const error = ref<string | null>(null);
const loading = ref(false);
const activate = async () => {
    error.value = null;
    loading.value = true;

    let result;

    try {
        result = await pluginStore.addPluginToMaterial(plugin.value);
        const editor = useEditorStore().getEditor();

        if(editor) {
            editor.redrawBlocks();
        }
    } catch(e) {
        result = undefined
    }

    if (!result) {
        error.value = $t('editor.plugin.manage.activate.error');
    }

    loading.value = false;
    emits('activate');
};

</script>

<style lang="scss" scoped>
.plugin {
    width: 100%;
    display: flex;
    flex-direction: column;
    background: var(--color-plugin-card-background);
    box-shadow: var(--shadow-accent);
    border-radius: var(--border-radius);
    overflow: hidden;
    position: relative;

    &--active {
        pointer-events: none;

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--color-plugin-card-background-active);
            z-index: 1;
        }
    }

    .icons {
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--color-plugin-card-icon-background);

        span {
            font-size: 3em;
            color: var(--color-plugin-card-icon-foreground);
        }
    }

    .meta {
        padding: 0.5rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.15em;
        font-size: 1.2em;

        p {
            margin: 0;
        }

        .author {
            font-size: 0.8rem;
            color: var(--color-text-subtle);
        }
    }

    .description {
        padding: 0.25rem 1rem;
        color: var(--color-text-subtle);
        font-style: italic;
        font-size: 0.8em;

        flex-grow: 1;
    }

    .lastVersion {
        padding: 0.25rem 1rem;
        color: var(--color-text-subtle);
        text-align: right;
        font-size: 0.6rem;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        padding: 0.25rem 1rem 1rem 1rem;
        gap: 0.5em;
    }
}
</style>
