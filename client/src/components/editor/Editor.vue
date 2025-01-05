<template>
    <article class="editor-view">
        <nav class="main">
            <button @mousedown="(e) => add(e, 'text')"><span class="mdi mdi-pencil-plus-outline"></span></button>
            <button @mousedown="(e) => add(e, 'image')"><span class="mdi mdi-image-plus-outline"></span></button>
            <button @mousedown="(e) => add(e, 'shape')"><span class="mdi mdi-shape-plus-outline"></span></button>

            <div class="spacer"></div>

            <button @click="clear"><span class="mdi mdi-delete-variant"></span></button>
            <button @click="open"><span class="mdi mdi-open-in-new"></span></button>
            <button @click="fit"><span class="mdi mdi-fit-to-screen-outline"></span></button>
            <button @click="changeMode"><span class="mdi mdi-cursor-move" v-if="mode === 'select'"></span><span
                class="mdi mdi-cursor-default" v-else></span></button>
        </nav>

        <div class="editor-container">
            <div class="editor" ref="editorElement" v-once v-html="''" :key="'editor'">
            </div>
        </div>

        <div class="editor-property-container">
            <div class="editor-property" ref="editorPropertyElement" v-once v-html="''" :key="'editor-property'">
            </div>
        </div>
    </article>

    <Keybinds :editor="editor" v-if="loaded"></Keybinds>
</template>

<script setup lang="ts">
import Editor from "@/editor/Editor";
import {onMounted, onUnmounted, ref, watch} from "vue";
import {TextEditorBlock} from "@/editor/block/text/TextEditorBlock";
import {encodeBase64, generateUUID} from "@/utils/Generators";
import {ImageEditorBlock} from "@/editor/block/image/ImageEditorBlock";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import {EditorMode} from "@/editor/EditorMode";
import {EditorDeserializer} from "@/editor/EditorDeserializer";
import {EditorSerializer} from "@/editor/EditorSerializer";
import {useRouter} from "vue-router";
import {EditorProperty} from "@/editor/property/EditorProperty";
import {ShapeEditorBlock} from "@/editor/block/shape/ShapeEditorBlock";
import Keybinds from "@/components/editor/Keybinds.vue";
import Slides from "@/components/editor/Slides.vue";
import {useMaterialStore} from "@/stores/material";
import Slide from "@/models/Slide";

const materialStore = useMaterialStore();

const editorElement = ref<HTMLElement | null>(null);
const editorPropertyElement = ref<HTMLElement | null>(null);

let editor: Editor;
let loaded = ref(false);

onMounted(() => {
    if (!editorElement.value) {
        console.error("Editor element not found");
        return;
    }
    materialStore.setEditorElement(editorElement.value);
    if (!editorPropertyElement.value) {
        console.error("Editor property element not found");
        return;
    }
    materialStore.setEditorPropertyElement(editorPropertyElement.value);
    materialStore.requestEditor();
});

watch(() => materialStore.getEditor(), (value) => {
    if (!value) return;
    if (!editorPropertyElement.value) return;

    if(editor) {
        destroy();
    }

    editor = value;
    editor.setMode(EditorMode.SELECT);

    loaded.value = true;
});

const destroy = () => {
    if(!editor) return;

    loaded.value = false;
}

onUnmounted(() => {
    destroy();
});

const mode = ref<'select' | 'move'>('select');

const changeMode = () => {
    mode.value = mode.value === 'select' ? 'move' : 'select';
    editor.setMode(mode.value === 'select' ? EditorMode.SELECT : EditorMode.MOVE);
};
const fit = () => editor.fitToParent();
const router = useRouter();
const open = () => {
    const serializer = new EditorSerializer(editor);
    const data = serializer.serialize();

    router.push({name: "Player", query: {data: encodeBase64(data)}});
};
const clear = () => {
    for(let block of [...editor.getBlocks()]) {
        if(!block.editorSupport().selection) continue;

        editor.removeBlock(block);
    }
}
const add = (event: MouseEvent, type: 'text' | 'rectangle' | 'image' | 'shape') => {
    const {x: startX, y: startY} = editor.screenToEditorCoordinates(event.clientX, event.clientY);

    if (!editor) {
        console.error("Editor not initialized");
        return;
    }

    let block!: EditorBlock;

    switch (type) {
        case 'text':
            block = new TextEditorBlock(
                generateUUID(),
                {x: -100, y: -100},
                {width: 300, height: 36},
                0,
                0,
                "<div>Test</div>",
                24
            );
            break;
        case 'shape':
            block = new ShapeEditorBlock(
                generateUUID(),
                {x: -100, y: -100},
                {width: 40, height: 40},
                0,
                0,
                "#beff3c",
                "arrow-1"
            );
            break;
        case 'image':
            block = new ImageEditorBlock(
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
    grid-template-columns: auto minmax(0, 1fr) 200px;
    grid-template-rows: minmax(0, 1fr);
    width: 100%;
    height: 100%;
    min-height: 0;
    min-width: 0;
    position: relative;
    overflow: hidden;

    nav.main {
        position: relative;
        z-index: 100;

        grid-row: 1 / 2;
        grid-column: 1 / 2;

        padding: 1rem;
        background-color: #e7e8e6;
        border-right: 2px solid #d0d3cc;

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

    .editor-property-container {
        grid-row: 1 / 2;
        grid-column: 3 / 4;
        background-color: #e7e8e6;
        border-left: 2px solid #d0d3cc;
    }
}

.editor-container {
    user-select: none;
    width: 100%;
    height: 100%;
    background-color: #e7e8e6;
    grid-row: 1 / 2;
    grid-column: 2 / 3;

    overflow: hidden;
    position: relative;
}
</style>
