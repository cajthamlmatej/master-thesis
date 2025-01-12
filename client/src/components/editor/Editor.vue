<template>
    <article class="editor-view">
        <div class="editor-container">
            <div class="editor" ref="editorElement" v-once v-html="''" :key="'editor'">
            </div>
        </div>
    </article>
</template>

<script setup lang="ts">
import Editor from "@/editor/Editor";
import {onMounted, onUnmounted, ref, watch} from "vue";
import {EditorMode} from "@/editor/EditorMode";
import {useMaterialStore} from "@/stores/material";

const materialStore = useMaterialStore();

const editorElement = ref<HTMLElement | null>(null);

let editor: Editor;
let loaded = ref(false);

onMounted(async () => {
    if (!editorElement.value) {
        console.error("Editor element not found");
        return;
    }
    materialStore.setEditorElement(editorElement.value);
    materialStore.requestEditor();
});

watch(() => materialStore.getEditor(), (value) => {
    if (!value) return;

    if (editor) {
        destroy();
    }

    editor = value;
    editor.setMode(EditorMode.SELECT);

    loaded.value = true;
});

const destroy = () => {
    if (!editor) return;

    loaded.value = false;
}

onUnmounted(() => {
    destroy();
});
</script>

<style scoped lang="scss">
article.editor-view {
    width: 100%;
    height: 100%;
    min-height: 0;
    min-width: 0;
    position: relative;
    overflow: hidden;
}

.editor-container {
    user-select: none;
    width: 100%;
    height: 100%;
    background-color: #e7e8e6;

    overflow: hidden;
    position: relative;
}
</style>
