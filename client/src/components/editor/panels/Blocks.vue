<template>
    <Navigation v-model:menu="blocksMenu" shift full-control>
        <template #primary>
            <div class="menu editor-blocks" ref="menu" v-show="blocksMenu">
                <button @mousedown="(e) => add(e, 'text')"><span class="mdi mdi-pencil-plus-outline"></span></button>
                <button @mousedown="(e) => add(e, 'image')"><span class="mdi mdi-image-plus-outline"></span></button>
                <button @mousedown="(e) => add(e, 'shape')"><span class="mdi mdi-shape-plus-outline"></span></button>
            </div>
        </template>
    </Navigation>
</template>

<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import {useMaterialStore} from "@/stores/material";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {TextEditorBlock} from "@/editor/block/text/TextEditorBlock";
import {generateUUID} from "@/utils/Generators";
import {ShapeEditorBlock} from "@/editor/block/shape/ShapeEditorBlock";
import {ImageEditorBlock} from "@/editor/block/image/ImageEditorBlock";
import Editor from "@/editor/Editor";

const blocksMenu = ref(true);

const props = defineProps<{
    value: boolean;
}>();

onMounted(() => {
    blocksMenu.value = props.value;
});

const emits = defineEmits(['update:value']);

watch(() => blocksMenu.value, (value) => {
    emits('update:value', value);
});

watch(() => props.value, (value) => {
    blocksMenu.value = value;
});

const materialStore = useMaterialStore();
const editor = ref<Editor | null>(null);

watch(() => materialStore.getEditor(), (value) => {
    editor.value = value as Editor;
});

const add = (event: MouseEvent, type: 'text' | 'rectangle' | 'image' | 'shape') => {
    const {x: startX, y: startY} = editor.value!.screenToEditorCoordinates(event.clientX, event.clientY);

    if (!editor.value) {
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

    editor.value.addBlock(block);
    block.move(startX, startY);

    const move = (event: MouseEvent) => {
        const {x, y} = editor.value!.screenToEditorCoordinates(event.clientX, event.clientY);

        block.move(x, y);

        blocksMenu.value = false;
    };

    const up = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);

        const diffX = block.position.x - startX;
        const diffY = block.position.y - startY;

        if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
            const canvasSize = editor.value!.getSize();
            const blockSize = block.size;
            block.move(canvasSize.width / 2 - blockSize.width / 2, canvasSize.height / 2 - blockSize.height / 2);
        }

        editor.value!.getSelector().selectBlock(block);
        blocksMenu.value = false;
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
};
</script>

<style scoped lang="scss">

</style>
