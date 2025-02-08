<template>

    <NavigationButton
        :disabled="!backward" :label="$t('editor.ui.history.undo')"
        :tooltip-text="$t('editor.ui.history.undo')"
        hide-mobile
        icon="undo"
        tooltip-position="bottom"
        @click="undo"></NavigationButton>
    <NavigationButton
        :disabled="!forward" :label="$t('editor.ui.history.redo')"
        :tooltip-text="$t('editor.ui.history.redo')"
        hide-mobile
        icon="redo"
        tooltip-position="bottom"
        @click="redo"></NavigationButton>
</template>

<script lang="ts" setup>
import {useMaterialStore} from "@/stores/material";
import {useEditorStore} from "@/stores/editor";
import {onMounted, onUnmounted, ref, watch} from "vue";
import {$t} from "@/translation/Translation";

const materialStore = useMaterialStore();
const editorStore = useEditorStore();

onMounted(() => {
    const editor = editorStore.getEditor();

    if (!editor) return;

    editor.events.HISTORY.on(recalculate)
    editor.events.HISTORY_JUMP.on(recalculate);
    recalculate();
});
onUnmounted(() => {
    const editor = editorStore.getEditor();

    if (!editor) return;

    editor.events.HISTORY.off(recalculate);
    editor.events.HISTORY_JUMP.off(recalculate);
})
watch(() => editorStore.getEditor(), (editor) => {
    if (editor) {
        editor.events.HISTORY.on(recalculate);
        editor.events.HISTORY_JUMP.on(recalculate);
        recalculate();
    }
});

const forward = ref<boolean>(false);
const backward = ref<boolean>(false);

const recalculate = () => {
    const editor = editorStore.getEditor();

    if (!editor) return;

    forward.value = editor.getHistory().canRedo();
    backward.value = editor.getHistory().canUndo();
};

const undo = () => {
    const editor = editorStore.getEditor();

    if (!editor) return;

    editor.getHistory().undo();
    recalculate();
};
const redo = () => {
    const editor = editorStore.getEditor();

    if (!editor) return;

    editor.getHistory().redo();
    recalculate();
};

</script>

<style lang="scss" scoped>

</style>
