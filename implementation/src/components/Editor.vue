<template>
    <div class="editor-container">
        <div class="editor" ref="editorElement" v-once v-html="''" :key="'editor'">
        </div>
    </div>
</template>

<script setup lang="ts">
import Editor from "@/editor/Editor";
import {onMounted, ref} from "vue";
import {TextBlock} from "@/editor/block/types/TextBlock";
import {generateUUID} from "@/utils/uuid";
import {RectangleBlock} from "@/editor/block/types/RectangleBlock";
import {WatermarkBlock} from "@/editor/block/types/WatermarkBlock";
import {ImageBlock} from "@/editor/block/types/ImageBlock";

const editorElement = ref<HTMLElement | null>(null);

onMounted(() => {
    if (!editorElement.value) {
        console.error("Editor element not found");
        return;
    }

    const editor = new Editor(editorElement.value);
    editor.addBlock(
        new TextBlock(
            generateUUID(),
            {x: 300, y: 100},
            {width: 300, height: 36},
            0,
            0,
            "<div>Test</div>",
            24
        ));
    editor.addBlock(
        new TextBlock(
            generateUUID(),
            {x: 420, y: 300},
            {width: 390, height: 36*2},
            0,
            0,
            "<div>Ahoj</div><div>Světe</div>",
            24
        ));
    editor.addBlock(
        new RectangleBlock(
            generateUUID(),
            {x: 20, y: 20},
            {width: 40, height: 40},
            0,
            0,
            "#ff8e3c"
        ));
    editor.addBlock(
        new WatermarkBlock(generateUUID()));

    const img = new ImageBlock(
        generateUUID(),
        {x: 40, y: 500},
        {width: 200, height: 200},
        0,
        0,
        "https://ssps.cajthaml.eu/img/logo-main-for-light-main.png"
    );
    img.rotate(-30);
    editor.addBlock(img);
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
