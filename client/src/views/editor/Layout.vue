<template>
    <Header v-model:menu="data.menu">
        <template #logo>
            <div class="flex flex-align-center" v-if="editor">
                <div class="meta">
                    <span class="title" data-cy="editor-title">{{ materialStore.currentMaterial?.name }}</span>

<!--                    <span class="state">{{ state }}</span>-->
                </div>

                <div class="flex gap-0-5">
<!--                    <Save @save="saved" @saving="saving" />-->
                    <Attendees />

                    <NavigationButton :label="$t('editor.navigation.preview')"
                                      :to="{ name: 'Player', params: { material: $route.params.material } }"
                                      :tooltip-text="$t('editor.navigation.preview')"
                                      icon="play"
                                      tooltip-position="bottom"></NavigationButton>

                    <Sharing/>

                    <NavigationButton
                        :label="$t('editor.navigation.dashboard')" :to="{name: 'Dashboard'}"
                        :tooltip-text="$t('editor.navigation.dashboard')"
                        hide-mobile
                        icon="solar-panel"
                        tooltip-position="bottom"></NavigationButton>
                </div>
            </div>
        </template>

        <template #navigation v-if="editor">
            <History/>

            <Preferences/>

            <ChangeLanguage header/>
        </template>
    </Header>

    <Navigation v-model:menu="data.menu" primary secondary-active>
        <template #primary>
            <NavigationButton :label="$t('editor.panel.slides.title')"
                              :tooltip-text="$t('editor.panel.slides.title')"
                              icon="cards-variant"
                              @click="slidesMenu = !slidesMenu"></NavigationButton>
            <NavigationButton :label="$t('editor.panel.blocks.title')"
                              :tooltip-text="$t('editor.panel.blocks.title')"
                              icon="plus-box-outline"
                              @click="blockMenu = !blockMenu"></NavigationButton>
            <NavigationButton :label="$t('editor.panel.media.title')"
                              :tooltip-text="$t('editor.panel.media.title')"
                              icon="multimedia"
                              @click="mediaMenu = !mediaMenu"></NavigationButton>
            <NavigationButton :label="$t('editor.panel.content.title')"
                              :tooltip-text="$t('editor.panel.content.title')"
                              icon="web-plus"
                              @click="contentMenu = !contentMenu"></NavigationButton>

            <EditorPlugins v-model:value="currentPluginMenu"></EditorPlugins>
        </template>
        <template #secondary>
            <NavigationButton :label="$t('editor.ui.fit-to-screen')"
                              :tooltip-text="$t('editor.ui.fit-to-screen')"
                              icon="fit-to-screen-outline"
                              @click="fitToScreen"></NavigationButton>
            <NavigationButton

                :icon="`mdi ${mode === EditorMode.SELECT ? 'mdi mdi-cursor-move' : 'mdi mdi-cursor-default'}`"
                :label="`${mode === EditorMode.SELECT ? $t('editor.ui.change-mode.to-move') : $t('editor.ui.change-mode.to-select')}`"
                :tooltip-text="`${mode === EditorMode.SELECT ? $t('editor.ui.change-mode.to-move') : $t('editor.ui.change-mode.to-select')}`"
                @click="changeMode"></NavigationButton>

            <NavigationButton
                :label="$t('editor.navigation.dashboard')" :to="{name: 'Dashboard'}"
                :tooltip-text="$t('editor.navigation.dashboard')"
                hide-desktop
                icon="solar-panel"
                tooltip-position="bottom"></NavigationButton>

            <History :header="false" />

            <Preferences :header="false"/>

            <ChangeLanguage :header="false"/>
        </template>
    </Navigation>

    <Slides v-if="editor" v-model:value="slidesMenu"></Slides>
    <Blocks v-if="editor" v-model:value="blockMenu"></Blocks>
    <Media v-if="editor" v-model:value="mediaMenu"></Media>
    <Content v-if="editor" v-model:value="contentMenu"></Content>

    <Keybinds v-if="editor"></Keybinds>
    <Properties/>

    <router-view v-slot="{ Component, route }">
        <transition mode="out-in" name="fade-ease">
            <main :key="route.name?.toString()">
                <component :is="Component"/>
            </main>
        </transition>
    </router-view>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, reactive, ref, toRaw, watch} from "vue";
import Slides from "@/components/editor/panels/Slides.vue";
import Blocks from "@/components/editor/panels/Blocks.vue";
import {useEditorStore} from "@/stores/editor";
import {EditorMode} from "@/editor/EditorMode";
import Properties from "@/components/editor/panels/Properties.vue";
import Keybinds from "@/components/editor/dialogs/Keybinds.vue";
import type Editor from "@/editor/Editor";
import Preferences from "@/components/editor/dialogs/Preferences.vue";
import {useRoute, useRouter} from "vue-router";
import {useMaterialStore} from "@/stores/material";
import Save from "@/components/editor/Save.vue";
import History from "@/components/editor/History.vue";
import {$t} from "@/translation/Translation";
import ChangeLanguage from "@/components/ChangeLanguage.vue";
import Sharing from "@/components/editor/dialogs/Sharing.vue";
import Media from "@/components/editor/panels/Media.vue";
import Content from "@/components/editor/panels/Content.vue";
import EditorPlugins from "@/components/plugin/EditorPlugins.vue";
import {usePluginStore} from "@/stores/plugin";
import moment from "moment";
import {useSeoMeta} from "unhead";
import {communicator} from "@/api/websockets";
import Material from "@/models/Material";
import Attendees from "@/components/editor/Attendees.vue";
import {EditorCommunicator} from "@/api/editorCommunicator";

const materialStore = useMaterialStore();


const state = ref($t('editor.ui.state.nothing'));

const data = reactive({
    menu: true
});

const editorStore = useEditorStore();
const pluginStore = usePluginStore();
const editor = ref<Editor | null>(null);

watch(() => editorStore.getEditor(), (value) => {
    editor.value = value as Editor;
});

const slidesMenu = ref(false);
const blockMenu = ref(false);
const mediaMenu = ref(false);
const contentMenu = ref(false);

const currentPluginMenu = ref<string | null>(null);

watch(() => slidesMenu.value, (value) => {
    if (slidesMenu.value) {
        blockMenu.value = false;
        mediaMenu.value = false;
        contentMenu.value = false;
        currentPluginMenu.value = null;
    }
});
watch(() => blockMenu.value, (value) => {
    if (blockMenu.value) {
        slidesMenu.value = false;
        mediaMenu.value = false;
        contentMenu.value = false;
        currentPluginMenu.value = null;
    }
});
watch(() => mediaMenu.value, (value) => {
    if (mediaMenu.value) {
        slidesMenu.value = false;
        blockMenu.value = false;
        contentMenu.value = false;
        currentPluginMenu.value = null;
    }
});
watch(() => contentMenu.value, (value) => {
    if (contentMenu.value) {
        slidesMenu.value = false;
        blockMenu.value = false;
        mediaMenu.value = false;
        currentPluginMenu.value = null;
    }
});
watch(() => currentPluginMenu.value, (value) => {
    if (currentPluginMenu.value) {
        slidesMenu.value = false;
        blockMenu.value = false;
        mediaMenu.value = false;
        contentMenu.value = false;
    }
});

const handleClick = (event: MouseEvent) => {
    if (event.target instanceof HTMLElement) {
        if (!event.target.closest(".editor-view")) return;

        slidesMenu.value = false;
        blockMenu.value = false;
        mediaMenu.value = false;
        contentMenu.value = false;
        // currentPluginMenu.value = null;
    }
}

const route = useRoute();
const router = useRouter();

onMounted(async () => {
    window.addEventListener("click", handleClick);

    await materialStore.load();
    await pluginStore.load();

    let materialId = route.params.material as string;

    if (materialId === 'new') {
        const material = await materialStore.createMaterial();
        materialId = material.id;

        await router.replace({name: 'Editor', params: {material: material.id}});
    }

    if (materialId) {
        await materialStore.loadMaterial(materialId);
    }

    useSeoMeta({
        title: $t('page.editor.title', {
            name: materialStore.currentMaterial?.name ?? ''
        })
    });

    await pluginStore.loaded;
    await communicator.setupEditorRoom(materialStore.currentMaterial! as Material);

    await editorStore.requestEditor();

    state.value = $t('editor.ui.state.last-save', {time: materialStore.currentMaterial?.updatedAt.fromNow() ?? ''});
});

onUnmounted(async () => {
    await communicator.leaveEditorRoom(materialStore.currentMaterial! as Material);
});

const saved = () => {
    state.value = $t('editor.ui.state.last-save', {time: moment().fromNow()});
}

const saving = () => {
    state.value = $t('editor.ui.state.saving');
}

onUnmounted(() => {
    window.removeEventListener("click", handleClick);
});


const mode = ref('select');

watch(() => editorStore.getEditor(), (value) => {
    if (!value) return;

    value.setMode(EditorMode.SELECT);
    mode.value = 'select';

    value.events.MODE_CHANGED.on(() => {
        mode.value = value.getMode();
    });
    value.getSelector().events.SELECTED_BLOCK_CHANGED.on((blocks) => {
        communicator.getEditorRoom()?.changeSelectedBlocks(blocks.map(a => a.id));
    });
    value.events.BLOCK_CHANGED.on((block) => {
        communicator.getEditorRoom()?.synchronizeBlock(block);
    });
    value.events.HISTORY_JUMP.on(() => {
        setTimeout(() => {
            for(let block of (editor.value?.getBlocks() ?? [])) {
                communicator.getEditorRoom()?.synchronizeBlock(block);
            }
        }, 400);
    });
    value.events.BLOCK_ADDED.on((slide) => {
        communicator.getEditorRoom()?.synchronizeBlock(slide);
    });
    value.events.BLOCK_REMOVED.on((slide) => {
        communicator.getEditorRoom()?.removeBlock(slide);
    });
});

const changeMode = () => {
    const editor = editorStore.getEditor();

    if (!editor) return;

    const m = editor.getMode();

    editor.setMode(m === EditorMode.MOVE ? EditorMode.SELECT : EditorMode.MOVE);
    mode.value = editor.getMode();
};
const fitToScreen = () => {
    const editor = editorStore.getEditor();

    if (!editor) return;

    editor.fitToParent();
};

</script>

<style lang="scss" scoped>
.alerts {
    position: fixed;
    bottom: 2em;
    right: 0.75em;

    z-index: 1000;
    width: 40vw;

    display: flex;
    flex-direction: column;
    gap: 1rem;
}

main {
    margin: 0 0 0 4.5em;
    padding: 0;
    overflow: hidden;

    @media (max-width: 768px) {
        margin: 0;
    }
}

.meta {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    width: clamp(10em, 30vw, 30em);
    margin-right: 1em;

    line-height: 1.25em;

    .title {
        font-size: 1.25em;
        font-weight: 500;
    }

    .title, .state {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .state {
        @media (max-width: 768px) {
            display: none;
        }
    }
    @media (max-width: 768px) {
        max-width: 400px;
    }
    @media (max-width: 468px) {
        max-width: 100px;
    }
}
</style>
