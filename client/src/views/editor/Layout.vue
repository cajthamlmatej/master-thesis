<template>
    <Header v-model:menu="data.menu">
        <template #logo>
        </template>

        <template #navigation>
            <History/>

            <Save/>

            <Preferences />

            <Sharing />

            <NavigationButton :label="$t('editor.navigation.preview')"
                              :to="{ name: 'Player', params: { material: $route.params.material } }" :tooltip-text="$t('editor.navigation.preview')"
                              hide-mobile
                              icon="presentation"
                              tooltip-position="bottom"></NavigationButton>

            <ChangeLanguage/>

            <NavigationButton
                :label="$t('editor.navigation.dashboard')" :to="{name: 'Dashboard'}"
                :tooltip-text="$t('editor.navigation.dashboard')"
                hide-mobile
                icon="solar-panel"
                tooltip-position="bottom"></NavigationButton>
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
        </template>
    </Navigation>

    <Slides v-model:value="slidesMenu"></Slides>
    <Blocks v-model:value="blockMenu"></Blocks>
    <Media v-model:value="mediaMenu"></Media>
    <Content v-model:value="contentMenu"></Content>

    <Keybinds v-if="editor" ></Keybinds>
    <Properties v-model:value="propertiesMenu"></Properties>

    <router-view v-slot="{ Component, route }">
        <transition mode="out-in" name="fade-ease">
            <main :key="route.name?.toString()">
                <component :is="Component"/>
            </main>
        </transition>
    </router-view>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, reactive, ref, watch} from "vue";
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

const data = reactive({
    menu: false
});

const editorStore = useEditorStore();
const materialStore = useMaterialStore();
const editor = ref<Editor | null>(null);

watch(() => editorStore.getEditor(), (value) => {
    editor.value = value as Editor;
});

const slidesMenu = ref(false);
const blockMenu = ref(false);
const propertiesMenu = ref(false);
const mediaMenu = ref(false);
const contentMenu = ref(false);

watch(() => slidesMenu.value, (value) => {
    if (slidesMenu.value) {
        blockMenu.value = false;
        mediaMenu.value = false;
        contentMenu.value = false;
    }
});
watch(() => blockMenu.value, (value) => {
    if (blockMenu.value) {
        slidesMenu.value = false;
        mediaMenu.value = false;
        contentMenu.value = false;
    }
});
watch(() => mediaMenu.value, (value) => {
    if (mediaMenu.value) {
        slidesMenu.value = false;
        blockMenu.value = false;
        contentMenu.value = false;
    }
});
watch(() => contentMenu.value, (value) => {
    if (contentMenu.value) {
        slidesMenu.value = false;
        blockMenu.value = false;
        mediaMenu.value = false;
    }
});

const handleClick = (event: MouseEvent) => {
    if (event.target instanceof HTMLElement) {
        if (!event.target.closest(".editor-view")) return;

        slidesMenu.value = false;
        blockMenu.value = false;
        mediaMenu.value = false;
        contentMenu.value = false;
    }
}

const route = useRoute();
const router = useRouter();

onMounted(async () => {
    window.addEventListener("click", handleClick);

    await materialStore.load();

    let materialId = route.params.material as string;

    if (materialId === 'new') {
        const material = await materialStore.createMaterial();
        materialId = material.id;

        await router.replace({name: 'Editor', params: {material: material.id}});
    }

    if (materialId) {
        await materialStore.loadMaterial(materialId);
    }

    await editorStore.requestEditor();
});

onUnmounted(() => {
    window.removeEventListener("click", handleClick);
});


const mode = ref('select');

watch(() => editorStore.getEditor(), (value) => {
    if (!value) return;

    value.setMode(EditorMode.SELECT);
    mode.value = 'select';
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

onMounted(async () => {
    // PLUGIN TEST
    let started = false;

    watch(() => editorStore.getEditor(), () => {
        if (!editorStore.getEditor()) return;

        if (started) return;

        started = true;


        // const plugin = new Plugin(`Basic`, `
        // export const onLoad = function() {
        //     api.log("This should be logged");
        // }
        //
        // export const onSlideChange = function() {
        //     api.log("Slide changed");
        //
        //     api.getEditor().addBlock({
        //         type: "text",
        //         position: {
        //             x: 100,
        //             y: 100
        //         },
        //         size: {
        //             width: 200,
        //             height: 100
        //         },
        //         rotation: 0,
        //         zIndex: 0,
        //         content: 'Ahoj Avo!!!',
        //         fontSize: 20,
        //     });
        // }
        //
        // `);
    });
});
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
    padding: 0 0 0 4.5em;

    @media (max-width: 768px) {
        padding: 0;
    }
}
</style>
