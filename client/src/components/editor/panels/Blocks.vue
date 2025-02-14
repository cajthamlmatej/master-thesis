<template>
    <Navigation v-model:menu="blocksMenu" full-control shift>
        <template #primary>
            <div v-show="blocksMenu" ref="menu" class="menu editor-blocks">
                <button @mousedown="(e) => add(e, 'text')"><span class="mdi mdi-pencil-plus-outline"></span></button>
                <button @mousedown="(e) => add(e, 'image')"><span class="mdi mdi-image-plus-outline"></span></button>
                <button @mousedown="(e) => add(e, 'shape')"><span class="mdi mdi-shape-plus-outline"></span></button>
                <button @mousedown="(e) => add(e, 'interactiveArea')"><span
                    class="mdi mdi-cursor-default-click-outline"></span></button>
                <button @mousedown="(e) => add(e, 'mermaid')"><span class="mdi mdi-chart-timeline"></span></button>
                <button @mousedown="(e) => add(e, 'iframe')"><span class="mdi mdi-application-parentheses-outline"></span></button>
            </div>
        </template>
    </Navigation>
</template>

<script lang="ts" setup>

import {onMounted, ref, toRaw, watch} from "vue";
import {useEditorStore} from "@/stores/editor";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {TextEditorBlock} from "@/editor/block/text/TextEditorBlock";
import {generateUUID} from "@/utils/Generators";
import {ShapeEditorBlock} from "@/editor/block/shape/ShapeEditorBlock";
import {ImageEditorBlock} from "@/editor/block/image/ImageEditorBlock";
import Editor from "@/editor/Editor";
import {InteractiveAreaEditorBlock} from "@/editor/block/interactiveArea/InteractiveAreaEditorBlock";
import {MermaidEditorBlock} from "@/editor/block/mermaid/MermaidEditorBlock";
import {IframeEditorBlock} from "@/editor/block/iframe/IframeEditorBlock";

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

const materialStore = useEditorStore();
const editor = ref<Editor | null>(null);

watch(() => materialStore.getEditor(), (value) => {
    editor.value = value as Editor;
});

const add = (event: MouseEvent, type: 'text' | 'image' | 'shape' | 'interactiveArea' | 'mermaid' | 'iframe') => {
    const editorValue = toRaw(editor.value);

    if (!editorValue) {
        console.error("Editor not initialized");
        return;
    }

    const {x: startX, y: startY} = editorValue.screenToEditorCoordinates(event.clientX, event.clientY);

    let block!: EditorBlock;

    const width = editorValue.getSize().width;
    const height = editorValue.getSize().height;

    const smaller = width < height ? width : height;

    switch (type) {
        case 'text':
            const fontSize = smaller / 20;
            const lineHeight = fontSize * 1.5;

            block = new TextEditorBlock(
                {
                    id: generateUUID(),
                    position: {x: -100, y: -100},
                    size: {width: Math.max(width / 4, 300), height: lineHeight},
                    rotation: 0,
                    zIndex: 0,
                },
                "Your text here",
                fontSize,
            );
            break;
        case 'shape':
            block = new ShapeEditorBlock(
                {
                    id: generateUUID(),
                    position: {x: -100, y: -100},
                    size: {width: smaller / 4, height: smaller / 4},
                    rotation: 0,
                    zIndex: 0,
                },
                "#1a1a19",
                "arrow-1"
            );
            break;
        case 'image':
            block = new ImageEditorBlock(
                {
                    id: generateUUID(),
                    position: {x: -100, y: -100},
                    size: {width: smaller / 4, height: smaller / 4},
                    rotation: 0,
                    zIndex: 0,
                },
                true,
                "https://robohash.org/" + generateUUID() + "?set=set4"
            );
            break;
        case 'interactiveArea':
            block = new InteractiveAreaEditorBlock(
                {
                    id: generateUUID(),
                    position: {x: -100, y: -100},
                    size: {width: smaller / 4, height: smaller / 4},
                    rotation: 0,
                    zIndex: 0,
                },
            );
            break;
        case 'mermaid':
            block = new MermaidEditorBlock(
                {
                    id: generateUUID(),
                    position: {x: -100, y: -100},
                    size: {width: smaller / 4, height: smaller / 4},
                    rotation: 0,
                    zIndex: 0,
                },
                "graph TB\na-->b");
            break;
        case 'iframe':
            block = new IframeEditorBlock(
                {
                    id: generateUUID(),
                    position: {x: -100, y: -100},
                    size: {width: smaller / 4, height: smaller / 4},
                    rotation: 0,
                    zIndex: 0,
                },
                "<p><b>Example</b> iframe</p>");
            break;
    }

    editorValue.addBlock(block);
    block.move(startX, startY);

    const move = (event: MouseEvent) => {
        const {x, y} = editorValue.screenToEditorCoordinates(event.clientX, event.clientY);

        block.move(x, y);

        blocksMenu.value = false;
    };

    const up = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);

        const diffX = block.position.x - startX;
        const diffY = block.position.y - startY;

        if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
            const canvasSize = editorValue.getSize();
            const blockSize = block.size;
            block.move(canvasSize.width / 2 - blockSize.width / 2, canvasSize.height / 2 - blockSize.height / 2);
        }

        editorValue.getSelector().selectBlock(block);
        blocksMenu.value = false;
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
};
</script>

<style lang="scss" scoped>

</style>
