<template>

    <NavigationButton
                      hide-mobile icon="undo"
                      :label="$t('editor.ui.history.undo')"
                      :tooltip-text="$t('editor.ui.history.undo')"
                      :disabled="!backward"
                      @click="undo"
                      tooltip-position="bottom"></NavigationButton>
    <NavigationButton
                      hide-mobile icon="redo"
                      :label="$t('editor.ui.history.redo')"
                      :tooltip-text="$t('editor.ui.history.redo')"
                      :disabled="!forward"
                      @click="redo"
                      tooltip-position="bottom"></NavigationButton>
</template>

<script setup lang="ts">
import {useMaterialStore} from "@/stores/material";
import {useEditorStore} from "@/stores/editor";
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {$t} from "@/translation/Translation";

const materialStore = useMaterialStore();
const editorStore = useEditorStore();

onMounted(() => {
    const editor = editorStore.getEditor();

    if(!editor) return;

    editor.events.HISTORY.on(recalculate)
    editor.events.HISTORY_JUMP.on(recalculate);
    recalculate();
});
onUnmounted(() => {
    const editor = editorStore.getEditor();

    if(!editor) return;

    editor.events.HISTORY.off(recalculate);
    editor.events.HISTORY_JUMP.off(recalculate);
})
watch(() => editorStore.getEditor(), (editor) => {
    if(editor) {
        editor.events.HISTORY.on(recalculate);
        editor.events.HISTORY_JUMP.on(recalculate);
        recalculate();
    }
});

const forward = ref<boolean>(false);
const backward = ref<boolean>(false);

const recalculate = () => {
    const editor = editorStore.getEditor();

    if(!editor) return;

    forward.value = editor.getHistory().canRedo();
    backward.value = editor.getHistory().canUndo();
};

const undo = () => {
    const editor = editorStore.getEditor();

    if(!editor) return;

    editor.getHistory().undo();
    recalculate();
};
const redo = () => {
    const editor = editorStore.getEditor();

    if(!editor) return;

    editor.getHistory().redo();
    recalculate();
};

</script>

<style scoped lang="scss">

</style>
