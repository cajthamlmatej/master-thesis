<template>
    <article class="editor-view">
        <nav class="main">
            <div class="logo"></div>

            <button @mousedown="(e) => add(e, 'text')"><span class="mdi mdi-pencil-plus-outline"></span></button>
            <button @mousedown="(e) => add(e, 'rectangle')"><span class="mdi mdi-shape-square-plus"></span></button>
            <button @mousedown="(e) => add(e, 'image')"><span class="mdi mdi-image-plus-outline"></span></button>

            <div class="spacer"></div>

            <button @click="fit"><span class="mdi mdi-fit-to-screen-outline"></span></button>
            <button @click="changeMode"><span class="mdi mdi-cursor-move" v-if="mode === 'select'"></span><span
                class="mdi mdi-cursor-default" v-else></span></button>
        </nav>

        <div class="editor-container">
            <div class="editor" ref="editorElement" v-once v-html="''" :key="'editor'">
            </div>
        </div>

    </article>
</template>

<script setup lang="ts">
import Editor from "@/editor/Editor";
import {onMounted, ref} from "vue";
import {TextBlock} from "@/editor/block/text/TextBlock";
import {generateUUID} from "@/utils/Generators";
import {RectangleBlock} from "@/editor/block/rectangle/RectangleBlock";
import {WatermarkBlock} from "@/editor/block/watermark/WatermarkBlock";
import {ImageBlock} from "@/editor/block/image/ImageBlock";
import type {Block} from "@/editor/block/Block";
import {EditorMode} from "@/editor/EditorMode";
import {EditorDeserializer} from "@/editor/EditorDeserializer";
import {EditorSerializer} from "@/editor/EditorSerializer";

const editorElement = ref<HTMLElement | null>(null);

let editor!: Editor;

onMounted(() => {
    if (!editorElement.value) {
        console.error("Editor element not found");
        return;
    }

    editor = new Editor(editorElement.value);

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
            {width: 390, height: 36 * 2},
            0,
            0,
            "<div>Ahoj</div><div>Světe</div>",
            24
        ));
    editor.addBlock(
        new WatermarkBlock(generateUUID()));

    const img = new ImageBlock(
        generateUUID(),
        {x: 40, y: 500},
        {width: 200, height: 200},
        -30,
        0,
        "https://ssps.cajthaml.eu/img/logo-main-for-light-main.png"
    );
    img.group = "group1";
    const rectangle = new RectangleBlock(
        generateUUID(),
        {x: 20, y: 20},
        {width: 40, height: 40},
        0,
        0,
        "#ff8e3c"
    );
    rectangle.group = "group1";
    editor.addBlock(rectangle);
    editor.addBlock(img);

    console.log(new EditorSerializer(editor).serialize());
});

const mode = ref<'select' | 'move'>('move');

const changeMode = () => {
    mode.value = mode.value === 'select' ? 'move' : 'select';
    editor.setMode(mode.value === 'select' ? EditorMode.SELECT : EditorMode.MOVE);
};
const fit = () => editor.fitToParent();

const add = (event: MouseEvent, type: 'text' | 'rectangle' | 'image') => {
    const {x: startX, y: startY} = editor.screenToEditorCoordinates(event.clientX, event.clientY);

    if (!editor) {
        console.error("Editor not initialized");
        return;
    }

    let block!: Block;

    switch (type) {
        case 'text':
            block = new TextBlock(
                generateUUID(),
                {x: -100, y: -100},
                {width: 300, height: 36},
                0,
                0,
                "<div>Test</div>",
                24
            );
            break;
        case 'rectangle':
            block = new RectangleBlock(
                generateUUID(),
                {x: -100, y: -100},
                {width: 40, height: 40},
                0,
                0,
                "#3cc4ff"
            );
            break;
        case 'image':
            block = new ImageBlock(
                generateUUID(),
                {x: -100, y: -100},
                {width: 200, height: 200},
                0,
                0,
                "https://robohash.org/" + generateUUID() + "?set=set4"
            );
            break;
    }

    editor.addBlock(block);
    block.move(startX, startY);

    const move = (event: MouseEvent) => {
        const {x, y} = editor.screenToEditorCoordinates(event.clientX, event.clientY);

        block.move(x, y);
    };

    const up = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);

        const diffX = block.position.x - startX;
        const diffY = block.position.y - startY;

        if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
            block.move(0, 0);
        }

        editor.getSelector().selectBlock(block);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
};
</script>

<style scoped lang="scss">
article.editor-view {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr);
    width: 100%;
    height: 100%;
    min-height: 0;
    min-width: 0;

    nav.main {
        position: relative;
        z-index: 100;

        grid-row: 1 / 2;
        grid-column: 1 / 2;

        padding: 1rem;
        background-color: #f5f5f5;
        border-right: 2px solid #e9ecef;

        display: flex;
        flex-direction: column;
        align-items: center;

        gap: 1rem;

        .spacer {
            flex-grow: 2;
            flex-basis: 100%;
        }

        button {
            width: 100%;
            aspect-ratio: 1/1;

            padding: 0.5rem 1rem;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 0.25rem;
            cursor: pointer;
        }

        .logo {
            width: 50px;
            height: 50px;
            background-color: #6bacec;
            margin-bottom: 2em;
            flex-shrink: 0;
        }
    }
}

.editor-container {
    user-select: none;
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
    grid-row: 1 / 2;
    grid-column: 2 / 3;

    overflow: hidden;
    position: relative;
}
</style>
