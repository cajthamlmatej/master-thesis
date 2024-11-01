<template>
    <div class="editor-container">
        <div class="editor" ref="editorElement">
        </div>
    </div>
</template>

<script setup lang="ts">
import Editor from "@/editor/Editor.ts";
import {onMounted, ref} from "vue";
import {TextBlock} from "@/editor/block/types/TextBlock";
import {generateUUID} from "@/utils/uuid";
import {RectangleBlock} from "@/editor/block/types/RectangleBlock";
import {WatermarkBlock} from "@/editor/block/types/WatermarkBlock";

const editorElement = ref<HTMLElement | null>(null);

const editor = ref<Editor | null>(null);

onMounted(() => {
    if (!editorElement.value) {
        console.error("Editor element not found");
        return;
    }

    editor.value = new Editor(editorElement.value);
    editor.value.addBlock(
        new TextBlock(
            generateUUID(),
            {x: 300, y: 100},
            {width: 300, height: 36},
            "<div>Test</div>",
            24
        ));
    editor.value.addBlock(
        new TextBlock(
            generateUUID(),
            {x: 420, y: 300},
            {width: 390, height: 36*2},
            "<div>Ahoj</div><div>Světe</div>",
            24
        ));
    editor.value.addBlock(
        new RectangleBlock(
            generateUUID(),
            {x: 20, y: 20},
            {width: 40, height: 40},
            "#ff8e3c"
        ));
    editor.value.addBlock(
        new WatermarkBlock(generateUUID()));
})
</script>

<style scoped lang="scss">
.editor-container {
    user-select: none;
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;

    display: flex;
    justify-content: center;
    align-items: center;

    overflow: hidden;
}
</style>
