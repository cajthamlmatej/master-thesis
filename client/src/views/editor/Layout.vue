<template>
    <Header v-model:menu="data.menu">
        <template #logo>
        </template>

        <template #navigation>
            <NavigationButton :disabled="true"
                              hide-mobile icon="solar-panel"
                              label="Dashboard"
                              tooltip-position="bottom"></NavigationButton>
        </template>
    </Header>

    <Navigation v-model:menu="data.menu" primary secondary-active>
        <template #primary>
            <NavigationButton icon="cards-variant" label="Slides" tooltip-text="Slides" @click="slidesMenu = !slidesMenu"></NavigationButton>
            <NavigationButton icon="plus-box-outline" label="Add block" tooltip-text="Add block" @click="blockMenu = !blockMenu"></NavigationButton>
        </template>
        <template #secondary>
            <NavigationButton icon="fit-to-screen-outline" label="Fit to the screen" tooltip-text="Fit to the screen" @click="fitToScreen"></NavigationButton>
            <NavigationButton
                :icon="`mdi ${mode === EditorMode.SELECT ? 'mdi mdi-cursor-move' : 'mdi mdi-cursor-default'}`"
                :label="`${mode === EditorMode.SELECT ? 'Turn on move mode' : 'Turn on select mode'}`"
                :tooltip-text="`${mode === EditorMode.SELECT ? 'Turn on move mode' : 'Turn on select mode'}`"
                @click="changeMode"></NavigationButton>
        </template>
    </Navigation>

    <Slides v-model:value="slidesMenu" ></Slides>
    <Blocks v-model:value="blockMenu" ></Blocks>

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
import Slides from "@/components/editor/Slides.vue";
import Blocks from "@/components/editor/Blocks.vue";
import {useMaterialStore} from "@/stores/material";
import {EditorMode} from "@/editor/EditorMode";

const data = reactive({
    menu: false
});

const slidesMenu = ref(false);
const blockMenu = ref(false);

watch(() => slidesMenu.value, (value) => {
    if(slidesMenu.value) {
        blockMenu.value = false;
    }
});
watch(() => blockMenu.value, (value) => {
    if(blockMenu.value) {
        slidesMenu.value = false;
    }
});

const handleClick = (event: MouseEvent) => {
    if (event.target instanceof HTMLElement) {
        if(!event.target.closest(".editor-view")) return;

        slidesMenu.value = false;
        blockMenu.value = false;
    }
}

onMounted(() => {
    window.addEventListener("click", handleClick);
});

onUnmounted(() => {
    window.removeEventListener("click", handleClick);
});


const materialStore = useMaterialStore();
const mode = ref('select');

watch(() => materialStore.getEditor(), (value) => {
    if (!value) return;

    value.setMode(EditorMode.SELECT);
    mode.value = 'select';
});

const changeMode = () => {
    const editor = materialStore.getEditor();

    if(!editor) return;

    const m = editor.getMode();

    editor.setMode(m === EditorMode.MOVE ? EditorMode.SELECT : EditorMode.MOVE);
    mode.value = editor.getMode();
};
const fitToScreen = () => {
    const editor = materialStore.getEditor();

    if(!editor) return;

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
</style>
