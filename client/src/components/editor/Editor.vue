<template>
    <article class="editor-view">
        <div class="editor-container">
            <div v-once :key="'editor'" ref="editorElement" class="editor" v-html="''">
            </div>
        </div>
    </article>
</template>

<script lang="ts" setup>
import Editor from "@/editor/Editor";
import {onMounted, onUnmounted, ref, watch} from "vue";
import {EditorMode} from "@/editor/EditorMode";
import {useEditorStore} from "@/stores/editor";

const materialStore = useEditorStore();

const editorElement = ref<HTMLElement | null>(null);

let editor: Editor;
let loaded = ref(false);

onMounted(async () => {
    if (!editorElement.value) {
        console.error("Editor element not found");
        return;
    }
    materialStore.setEditorElement(editorElement.value);
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

<style lang="scss" scoped>
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

    overflow: hidden;
    position: relative;

    --background-primary: #f6f6f6;
    --background-secondary: #e8e8e8;
    background-color: var(--background-primary);
    background-image: linear-gradient(var(--background-secondary) 2px, transparent 2px), linear-gradient(90deg, var(--background-secondary) 2px, transparent 2px), linear-gradient(var(--background-secondary) 1px, transparent 1px), linear-gradient(90deg, var(--background-secondary) 1px, var(--background-primary) 1px);
    background-size: 50px 50px, 50px 50px, 10px 10px, 10px 10px;
    background-position: -2px -2px, -2px -2px, -1px -1px, -1px -1px;
}
</style>
